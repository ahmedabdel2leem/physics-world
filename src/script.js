import CANNON from 'cannon'
import GUI from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
/**
 * Debug
 */
const gui = new GUI()
const debugObject = {}

debugObject.createSphere = () => {
    createSphere( 
        Math.random()*0.5 
        , {
            x:Math.random(),
            y:1,
            z:Math.random()} )
}
debugObject.createCube = () => {
    createCube( 
        Math.random()*1 ,
        Math.random()*1 ,
        Math.random()*1 
        , {
            x:Math.random()*3,
            y:1,
            z:Math.random()*3} )
}
gui.add(debugObject, 'createSphere').name('Create Sphere')
gui.add(debugObject, 'createCube').name('Create Cube')
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')




// Scene
const scene = new THREE.Scene()


/** Sounds
 *  
 * 
*/
const hitSound = new Audio('./sounds/hit.mp3')
let lastHitSoundTime = 0
const HIT_SOUND_DELAY = 0.1 

const playHitsound = (collision) => {
    const currentTime = Date.now() / 1000 
    const timeSinceLastHit = currentTime - lastHitSoundTime

    if(timeSinceLastHit >= HIT_SOUND_DELAY) {
        const impactVelocity = collision.contact.getImpactVelocityAlongNormal()
        
        if(impactVelocity > 1.5){
            hitSound.currentTime = 0
            hitSound.volume = Math.min(impactVelocity / 10, 1)
            hitSound.play()
            lastHitSoundTime = currentTime
        }
    }
}
/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])


/**
 * Physics
 */
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world) // this is the better for performance
world.allowSleep = true;
// sleepSpeed  we can control even how fast it goes to sleep
world.gravity.set(0, -9.82, 0)

// Material
const defaultMaterial = new CANNON.Material('default')
// const concreteMaterial = new CANNON.Material('concrete')
// const plasticMaterial = new CANNON.Material('plastic')

//contact material
const contactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1, // default is 0.3 
        restitution: 0.7 // default is 0.3
    }
)
world.addContactMaterial(contactMaterial)


/**
 * Objects
 */



const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body({
    // mass: 0,
    // position: new CANNON.Vec3(0, 0, 0),
    // shape: floorShape,
})
floorBody.addShape(floorShape)
// floorBody.quaternion.setFromEuler(-Math.PI * 0.5, 0, 0)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
floorBody.material = defaultMaterial
world.addBody(floorBody)








/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Walls to stop the objects from the infinity
 */
const WallsGeometry = new THREE.PlaneGeometry( 10, 5)
const WallsMaterial = new THREE.MeshStandardMaterial({
    color: '#777777',
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
    side: THREE.DoubleSide
})
const Wall1 = new THREE.Mesh(
    WallsGeometry,
    WallsMaterial
)
const Wall2 = new THREE.Mesh(
    WallsGeometry,
    WallsMaterial
)
const Wall3 = new THREE.Mesh(
    WallsGeometry,
    WallsMaterial
)
const Wall4 = new THREE.Mesh(
    WallsGeometry,
    WallsMaterial
)

Wall1.position.y = 2.5
Wall1.rotation.y = Math.PI *0.5
Wall1.position.x = -5

Wall2.position.y = 2.5
Wall2.rotation.y = Math.PI *0.5
Wall2.position.x = 5

Wall3.position.z = 5
Wall3.rotation.x = Math.PI
Wall3.position.y = 2.5
Wall4.position.y = 2.5
Wall4.rotation.x = Math.PI 
Wall4.position.z = -5
scene.add( Wall4 , Wall3,Wall2,Wall1)

// Physics bodies for walls
const wallShape = new CANNON.Plane()

// Wall1 (left wall, facing positive X)
const wall1Body = new CANNON.Body({
    mass: 0 // static body
})
wall1Body.addShape(wallShape)
wall1Body.position.set(-5, 2.5, 0)
wall1Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI * 0.5)
wall1Body.material = defaultMaterial
world.addBody(wall1Body)

// Wall2 (right wall, facing negative X)
const wall2Body = new CANNON.Body({
    mass: 0 // static body
})
wall2Body.addShape(wallShape)
wall2Body.position.set(5, 2.5, 0)
wall2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI * 0.5)
wall2Body.material = defaultMaterial
world.addBody(wall2Body)

// Wall3 (front wall, facing negative Z)
const wall3Body = new CANNON.Body({
    mass: 0 // static body
})
wall3Body.addShape(wallShape)
wall3Body.position.set(0, 2.5, 5)
wall3Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI)
wall3Body.material = defaultMaterial
world.addBody(wall3Body)

// Wall4 (back wall, facing positive Z)
const wall4Body = new CANNON.Body({
    mass: 0 // static body
})
wall4Body.addShape(wallShape)
wall4Body.position.set(0, 2.5, -5)
wall4Body.material = defaultMaterial
world.addBody(wall4Body)
/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

/*
UTILITIES
*/

const ObjectsToUpdate = [];
const sphereGeometry = new THREE.SphereGeometry(1,20,20)
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
    color: '#4c2929'
})
gui.addColor(sphereMaterial, 'color').name('Sphere Color')
const BoxGeometry = new THREE.BoxGeometry(1,1,1)
// const BoxMaterial = new THREE.MeshStandardMaterial({
//     metalness: 0.3,
//     roughness: 0.4,
//     envMap: environmentMapTexture,
//     envMapIntensity: 0.5,
//     color: '#ffffff'
// })

const createSphere = (radius,position) => {

    // threejs mesh
    const mesh = new THREE.Mesh(
      sphereGeometry,
      sphereMaterial
    )
    // insted of radius we use 1 because we are using the same geometry for all spheres and using scale to make the sphere bigger
    mesh.scale.set(radius,radius,radius)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)

    // CANNON.js Body
    const shape = new CANNON.Sphere(radius)
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0,3,0),
        shape: shape,
        material: defaultMaterial
    })
    body.position.copy(position)
    world.addBody(body)
    body.addEventListener('collide', (collision) => {
        playHitsound(collision)
    })
    // save in the array to UPdate
    ObjectsToUpdate.push({ mesh, body,type:'sphere' })
}

const createCube = (width,height,depth, position) => {
    const mesh = new THREE.Mesh(
        BoxGeometry,
        sphereMaterial
    )
    mesh.scale.set(width,height,depth)
    mesh.position.copy(position)
    scene.add(mesh)

    const shape = new CANNON.Box(new CANNON.Vec3(width/2,height/2,depth/2))
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0,3,0),
        shape: shape,
        material: defaultMaterial
    })

    body.position.copy(position)

    body.addEventListener('collide', (collision) => {
        playHitsound(collision)
    })

    world.addBody(body)

    
    // save in the array to UPdate
    ObjectsToUpdate.push({ mesh, body,type:'cube' })
}
    createSphere( 0.5 , {x:0,y:3,z:0} )
    createCube( 1,1,1 , {x:0,y:3,z:0} )


    const clock = new THREE.Clock()
    let oldElapsedTime = 0
    const tick = () =>
    {
        const elapsedTime = clock.getElapsedTime()
        const deltaTime = elapsedTime - oldElapsedTime
        oldElapsedTime = elapsedTime
        // Update Physics World
        world.step(1/60 , deltaTime , 3)

        // Update Objects
        ObjectsToUpdate.forEach(object => {
            object.mesh.position.copy(object.body.position)
            // object.mesh.position.y = object.body.position.y - 0.1
            if(object.type === 'cube'){
                object.mesh.quaternion.copy(object.body.quaternion)
            }
        })




        // Update controls
        controls.update()

        // Render
        renderer.render(scene, camera)

        // Call tick again on the next frame
        window.requestAnimationFrame(tick)
    }

    tick()