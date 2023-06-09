const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 500;

const networkContext = networkCanvas.getContext("2d");
const carContext = carCanvas.getContext("2d");
const road = new Road(carCanvas.width/2, carCanvas.width*0.9, 3)

const info = document.getElementById("info");

const n = 125
const cars = generateCars(n)
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(
            localStorage.getItem("bestBrain")
        );
        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.1)
        }
    }
}

let traffic = [];

for (let i = 0; i < 125; i++) {
    traffic.push(new Car(road.getLaneCenter(Math.round(Math.random()*road.laneCount)), -i * 150, 30, 50, "DUMMY", road, 2))
}

animate();

function save() {
    localStorage.setItem("bestBrain",
    JSON.stringify(bestCar.brain));
}

function discard() {
    localStorage.removeItem("bestBrain");
}

function generateCars(n) {
    const cars = [];
    for (let i = 1; i <= n; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI", road));
    }
    return cars;
}
function animate(time) {
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, [])
    }
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    bestCar=cars.find(
        c => c.fitnessScore == Math.max(
            ...cars.map(c => c.fitnessScore)
            )
    )
    document.getElementById("bestFitnessScore").innerText = Math.round(bestCar.fitnessScore * 100) / 100
    document.getElementById("runningAgents").innerText = cars.map(c => c.damaged).filter(item => !item).length;

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;
    
    carContext.save();
    carContext.translate(0, -bestCar.y+carCanvas.height*0.7)
    road.draw(carContext);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carContext, "orange");
    }
    carContext.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carContext, "blue");
    }
    carContext.globalAlpha = 1;
    bestCar.draw(carContext, "blue", true);

    carContext.restore();

    networkContext.lineDashOffset = -time/50;
    Visualizer.drawNetwork(networkContext, bestCar.brain);
    requestAnimationFrame(animate);
}