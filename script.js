// Simple dataset: 20 points, 10 class 0, 10 class 1
const dataset = [
    {x: 1, y: 2, label: 0}, {x: 2, y: 3, label: 0}, {x: 3, y: 1, label: 0}, {x: 4, y: 4, label: 0}, {x: 5, y: 2, label: 0},
    {x: 1.5, y: 4, label: 0}, {x: 2.5, y: 1.5, label: 0}, {x: 3.5, y: 3.5, label: 0}, {x: 4.5, y: 1, label: 0}, {x: 5.5, y: 3, label: 0},
    {x: 2, y: 1, label: 1}, {x: 3, y: 4, label: 1}, {x: 4, y: 2, label: 1}, {x: 5, y: 5, label: 1}, {x: 1, y: 3, label: 1},
    {x: 2.5, y: 4.5, label: 1}, {x: 3.5, y: 2, label: 1}, {x: 4.5, y: 4, label: 1}, {x: 5.5, y: 1.5, label: 1}, {x: 1.5, y: 1.5, label: 1}
];

// Simple model implementations
class SimpleDecisionTree {
    constructor() {
        this.splitX = 3.5; // Simple split
    }

    predict(point) {
        return point.x < this.splitX ? 0 : 1;
    }

    drawBoundary(ctx, width, height) {
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.splitX * 50, 0);
        ctx.lineTo(this.splitX * 50, height);
        ctx.stroke();
    }
}

class SimpleSVM {
    constructor() {
        this.w = [0.5, -0.3]; // Simple linear weights
        this.b = -1.5;
    }

    predict(point) {
        const score = this.w[0] * point.x + this.w[1] * point.y + this.b;
        return score > 0 ? 1 : 0;
    }

    drawBoundary(ctx, width, height) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Draw line: w0*x + w1*y + b = 0 => y = (-w0*x - b)/w1
        const x1 = 0;
        const y1 = (-this.w[0] * x1 - this.b) / this.w[1];
        const x2 = 6;
        const y2 = (-this.w[0] * x2 - this.b) / this.w[1];
        ctx.moveTo(x1 * 50, (5 - y1) * 50);
        ctx.lineTo(x2 * 50, (5 - y2) * 50);
        ctx.stroke();
    }
}

class SimpleKNN {
    constructor(k = 3) {
        this.k = k;
        this.trainData = dataset;
    }

    predict(point) {
        const distances = this.trainData.map(d => ({
            dist: Math.sqrt((d.x - point.x)**2 + (d.y - point.y)**2),
            label: d.label
        })).sort((a, b) => a.dist - b.dist);
        const neighbors = distances.slice(0, this.k);
        const vote0 = neighbors.filter(n => n.label === 0).length;
        const vote1 = neighbors.filter(n => n.label === 1).length;
        return vote1 > vote0 ? 1 : 0;
    }

    drawBoundary(ctx, width, height) {
        // For simplicity, don't draw KNN boundary as it's complex
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 1;
        // Just draw circles around points or something simple
        // Actually, skip for now
    }
}

// Meta-learner: simple majority vote
class SimpleMetaLearner {
    constructor(baseModels) {
        this.baseModels = baseModels;
    }

    predict(point) {
        const preds = this.baseModels.map(model => model.predict(point));
        const vote1 = preds.filter(p => p === 1).length;
        const vote0 = preds.filter(p => p === 0).length;
        return vote1 > vote0 ? 1 : 0;
    }
}

// Utility functions
function drawPoints(ctx, points, scale = 50, offsetY = 5) {
    points.forEach(point => {
        ctx.fillStyle = point.label === 0 ? 'red' : 'blue';
        ctx.beginPath();
        ctx.arc(point.x * scale, (offsetY - point.y) * scale, 5, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function drawCanvas(canvasId, drawFunc) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFunc(ctx, canvas.width, canvas.height);
}

// Initialize models
const dt = new SimpleDecisionTree();
const svm = new SimpleSVM();
const knn = new SimpleKNN();
const meta = new SimpleMetaLearner([dt, svm, knn]);

// Event listeners
// Event listeners
document.getElementById('start-tutorial').addEventListener('click', () => {
    document.getElementById('introduction').classList.add('hidden');
    document.getElementById('tutorial').classList.remove('hidden');
    
    // Draw all visualizations
    drawCanvas('dataset-canvas', (ctx) => {
        drawPoints(ctx, dataset);
    });
    
    drawCanvas('dt-canvas', (ctx) => {
        drawPoints(ctx, dataset, 25, 2.5);
        dt.drawBoundary(ctx, 200, 150);
    });
    drawCanvas('svm-canvas', (ctx) => {
        drawPoints(ctx, dataset, 25, 2.5);
        svm.drawBoundary(ctx, 200, 150);
    });
    drawCanvas('knn-canvas', (ctx) => {
        drawPoints(ctx, dataset, 25, 2.5);
        // KNN boundary not drawn
    });
    
    // Populate predictions table
    const tbody = document.getElementById('predictions-body');
    tbody.innerHTML = '';
    dataset.forEach((point, i) => {
        const dtPred = dt.predict(point);
        const svmPred = svm.predict(point);
        const knnPred = knn.predict(point);
        const row = `<tr>
            <td>${i + 1}</td>
            <td>${point.label}</td>
            <td>${dtPred}</td>
            <td>${svmPred}</td>
            <td>${knnPred}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
    
    drawCanvas('meta-canvas', (ctx) => {
        // Simple visualization of meta-learner
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillText('Meta-Learner', 150, 50);
        ctx.fillText('Combines base predictions', 100, 80);
        ctx.fillText('Majority Vote', 150, 110);
    });
});

document.getElementById('restart').addEventListener('click', () => {
    document.getElementById('tutorial').classList.add('hidden');
    document.getElementById('introduction').classList.remove('hidden');
});

document.getElementById('next-1').addEventListener('click', () => showStep(2));
document.getElementById('next-2').addEventListener('click', () => showStep(3));
document.getElementById('next-3').addEventListener('click', () => showStep(4));
document.getElementById('next-4').addEventListener('click', () => showStep(5));

document.getElementById('prev-2').addEventListener('click', () => showStep(1));
document.getElementById('prev-3').addEventListener('click', () => showStep(2));
document.getElementById('prev-4').addEventListener('click', () => showStep(3));
document.getElementById('prev-5').addEventListener('click', () => showStep(4));

document.getElementById('predict-btn').addEventListener('click', () => {
    const x = parseFloat(document.getElementById('test-x').value);
    const y = parseFloat(document.getElementById('test-y').value);
    if (isNaN(x) || isNaN(y)) {
        document.getElementById('prediction-result').textContent = 'Please enter valid coordinates.';
        return;
    }
    const point = {x, y};
    const dtPred = dt.predict(point);
    const svmPred = svm.predict(point);
    const knnPred = knn.predict(point);
    const finalPred = meta.predict(point);
    document.getElementById('prediction-result').textContent = 
        `Base predictions: DT=${dtPred}, SVM=${svmPred}, KNN=${knnPred} → Final: ${finalPred}`;
});

document.getElementById('restart').addEventListener('click', () => {
    document.getElementById('tutorial').classList.add('hidden');
    document.getElementById('introduction').classList.remove('hidden');
});