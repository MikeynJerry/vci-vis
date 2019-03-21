import * as THREE from 'three';
import * as OrbitControls from 'three-orbitcontrols';
export default container => {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(700, 700);
  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(60, 700 / 700, 0.1, 1000);

  const controls = new OrbitControls(camera);
  camera.position.set(0, 20, 100);
  controls.update();

  const seeds = new Array(20 * 20)
    .fill(0)
    .map((d, i) => [(((i / 20) | 0) / 20) * 490, ((i % 20) / 20) * 490, 5]);
  console.log(seeds);
  for (let i = 0; i < Math.min(1000, seeds.length); ++i) {
    const [x, y, z] = seeds[i];
    if (x < 0 || x > 490) throw 'x';
    if (y < 0 || y > 490) throw 'y';
    if (z < 0 || z > 280) throw 'z';
  }

  const scene = new THREE.Scene();
  const group = new THREE.Group();
  group.position.set(-490 / 2, -490 / 2, 0);
  scene.add(group);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  container.addEventListener(
    'mousemove',
    e => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    },
    false
  );

  const geometry = new THREE.PlaneGeometry(490, 490);
  const material = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const groups = [];

  let prev = new THREE.Vector2();

  const step = () => {
    requestAnimationFrame(step);
    controls.update();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(mesh);
    if (intersects.length) {
      const uv = intersects[0].uv;
      if (prev.distanceTo(uv) > 0.01) {
        const origin = [uv.x * 490, uv.y * 490, 5.0];
        const seeds = makeSeedsAroundPoint(origin);
        const group2 = new THREE.Group();
        groups.push(group2);
        group.add(group2);

        const controller = new AbortController();
        doRequest(group2, seeds, controller.signal)
          .catch(() => null)
          .then(() => {
            if (groups.length > 10) {
              const g = groups.shift();
              group.remove(g);
            }
          });
        setTimeout(() => controller.abort(), 1000);
        prev.copy(uv);
      }
    }
    renderer.render(scene, camera);
  };
  step();
};

function makeSeedsAroundPoint(origin) {
  const d = 20;
  const rev = 2;
  const n = 8;
  const x = origin[0];
  const y = origin[1];
  const z = origin[2];
  const seeds = [];
  for (let i = 0; i < n; ++i) {
    const theta = (2 * Math.PI * rev * i) / n;
    seeds.push([
      x + (i / n) * d * Math.cos(theta),
      y + (i / n) * d * Math.sin(theta),
      z
    ]);
  }
  return seeds;
}

async function doRequest(scene, seeds, signal) {
  const colors = [
    '#f7fcfd',
    '#e5f5f9',
    '#ccece6',
    '#99d8c9',
    '#66c2a4',
    '#41ae76',
    '#238b45',
    '#006d2c',
    '#00441b'
  ].map(d => +('0x' + d.substring(1)));

  const response = await fetch(
    'http://accona.eecs.utk.edu:8840/service/job/streamline',
    {
      method: 'POST',
      body: JSON.stringify({
        partitions: 8,
        hostid: 0,
        seeds: [].concat(...seeds)
      }),
      signal
    }
  );

  for await (const data of ndjson(ndlines(response))) {
    console.log(data);
    for (let streamline of data.points) {
      const geometry = new THREE.Geometry();
      for (let i = 0; i < streamline.length; i += 3) {
        const x = streamline[i + 0];
        const y = streamline[i + 1];
        const z = streamline[i + 2];
        if (x < 0 || x > 490) console.warn('x', x, y, z);
        if (y < 0 || y > 490) console.warn('y', x, y, z);
        if (z < 0 || z > 280) console.warn('z', x, y, z);
        geometry.vertices.push(new THREE.Vector3(x, y, z));
      }

      const material = new THREE.LineBasicMaterial({
        color: colors[data.seq % colors.length]
      });

      const line = new THREE.Line(geometry, material);
      scene.add(line);
    }
  }
}

async function* ndjson(lines) {
  for await (const line of lines) {
    yield JSON.parse(line);
  }
}

async function* ndlines(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let data = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      console.log('done');
      return;
    }
    data += decoder.decode(value);
    while (true) {
      const index = data.indexOf('\n');
      if (index === -1) break;
      const line = data.substring(0, index);
      yield line;
      data = data.substring(index + 1);
    }
  }
}
