// Neural Theory Lab - Main JavaScript
// Interactive Neural Network Visualizations and Mathematical Simulations

// Global variables
let currentNetwork = null;
let neuralNetworkSketch = null;
let trainingInProgress = false;
let dataset = [];
let lossChart = null;
let networkVisualization = null;

// Neural Network Types and their configurations
const networkTypes = {
    perceptron: {
        name: 'Perceptron',
        description: 'Single neuron with linear decision boundary',
        equations: [
            'y = σ(w·x + b)',
            'σ(z) = 1/(1 + e^(-z))',
            'w ← w + α(y_true - y_pred)x',
            'b ← b + α(y_true - y_pred)'
        ],
        nodes: [2, 1],
        connections: [[0, 2], [1, 2]]
    },
    mlp: {
        name: 'Multi-Layer Perceptron',
        description: 'Deep feedforward network with multiple hidden layers',
        equations: [
            'h₁ = σ(W₁x + b₁)',
            'h₂ = σ(W₂h₁ + b₂)',
            'ŷ = W₃h₂ + b₃',
            'L = -Σy log(ŷ)'
        ],
        nodes: [3, 4, 4, 2],
        connections: 'fully-connected'
    },
    cnn: {
        name: 'Convolutional Neural Network',
        description: 'Specialized for image processing with convolutional layers',
        equations: [
            '(I * K)(i,j) = ΣΣ I(m,n)K(i-m,j-n)',
            'P(i,j) = max(R(i×s:(i+1)×s, j×s:(j+1)×s))',
            'F = flatten(P)',
            'ŷ = σ(W·F + b)'
        ],
        nodes: [1, 3, 3, 2],
        connections: 'convolutional'
    },
    rnn: {
        name: 'Recurrent Neural Network',
        description: 'Processes sequential data with memory',
        equations: [
            'h_t = tanh(W_h·h_{t-1} + W_x·x_t + b)',
            'ŷ_t = σ(V·h_t + c)',
            '∂L/∂W = Σ_t ∂L_t/∂W',
            '∂h_t/∂h_k = ∏_{i=k+1}^t ∂h_i/∂h_{i-1}'
        ],
        nodes: [2, 3, 2],
        connections: 'recurrent'
    },
    lstm: {
        name: 'Long Short-Term Memory',
        description: 'Advanced RNN with gating mechanisms',
        equations: [
            'f_t = σ(W_f·[h_{t-1}, x_t] + b_f)',
            'i_t = σ(W_i·[h_{t-1}, x_t] + b_i)',
            'C_t = f_t ⊙ C_{t-1} + i_t ⊙ C̃_t',
            'o_t = σ(W_o·[h_{t-1}, x_t] + b_o)'
        ],
        nodes: [2, 4, 2],
        connections: 'lstm-gates'
    },
    transformer: {
        name: 'Transformer',
        description: 'Attention-based architecture for sequences',
        equations: [
            'Attention(Q,K,V) = softmax(QK^T/√d_k)V',
            'MultiHead(Q,K,V) = Concat(head_1,...,head_h)W^O',
            'FFN(x) = max(0, xW_1 + b_1)W_2 + b_2',
            'LayerNorm(x + Sublayer(x))'
        ],
        nodes: [4, 4, 4],
        connections: 'attention'
    },
    gan: {
        name: 'Generative Adversarial Network',
        description: 'Two networks competing: generator vs discriminator',
        equations: [
            'min_G max_D V(D,G) = E_x[log D(x)] + E_z[log(1-D(G(z)))]',
            'G(z) = tanh(W_g·z + b_g)',
            'D(x) = σ(W_d·x + b_d)',
            'L_G = -E_z[log D(G(z))]'
        ],
        nodes: [2, 4, 2],
        connections: 'adversarial'
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTypewriter();
    initializeNeuralCanvas();
    initializeScrollAnimations();
    initializeParameterControls();
    initializeDatasetPlayground();
    setupEventListeners();
});

// Typewriter effect for hero section
function initializeTypewriter() {
    const typewriterStrings = [
        'Interactive Mathematical Explorations',
        'Visualize Neural Network Architectures',
        'Understand the Mathematics of AI',
        'Explore Gradient Descent and Backpropagation',
        'Master Attention Mechanisms'
    ];
    
    new Typed('#typewriter-text', {
        strings: typewriterStrings,
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });
}

// Initialize p5.js neural network background
function initializeNeuralCanvas() {
    neuralNetworkSketch = new p5((p) => {
        let nodes = [];
        let connections = [];
        let particles = [];
        
        p.setup = function() {
            const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
            canvas.parent('neural-canvas');
            canvas.style('position', 'absolute');
            canvas.style('top', '0');
            canvas.style('left', '0');
            canvas.style('z-index', '1');
            
            // Create nodes
            for (let i = 0; i < 50; i++) {
                nodes.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    vx: p.random(-0.5, 0.5),
                    vy: p.random(-0.5, 0.5),
                    size: p.random(3, 8),
                    alpha: p.random(0.3, 0.8)
                });
            }
            
            // Create connections
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    let dist = p.dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                    if (dist < 150) {
                        connections.push({
                            from: i,
                            to: j,
                            strength: p.map(dist, 0, 150, 1, 0)
                        });
                    }
                }
            }
        };
        
        p.draw = function() {
            p.clear();
            
            // Update and draw connections
            p.stroke(0, 212, 255, 50);
            p.strokeWeight(1);
            for (let conn of connections) {
                let from = nodes[conn.from];
                let to = nodes[conn.to];
                p.line(from.x, from.y, to.x, to.y);
            }
            
            // Update and draw nodes
            p.noStroke();
            for (let node of nodes) {
                // Update position
                node.x += node.vx;
                node.y += node.vy;
                
                // Bounce off edges
                if (node.x < 0 || node.x > p.width) node.vx *= -1;
                if (node.y < 0 || node.y > p.height) node.vy *= -1;
                
                // Draw node
                p.fill(0, 212, 255, node.alpha * 255);
                p.ellipse(node.x, node.y, node.size);
                
                // Add glow effect
                p.fill(74, 222, 128, node.alpha * 50);
                p.ellipse(node.x, node.y, node.size * 2);
            }
            
            // Add flowing particles
            if (p.frameCount % 60 === 0) {
                particles.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    vx: p.random(-1, 1),
                    vy: p.random(-1, 1),
                    life: 255
                });
            }
            
            // Update and draw particles
            p.fill(251, 191, 36);
            for (let i = particles.length - 1; i >= 0; i--) {
                let particle = particles[i];
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life -= 2;
                
                p.ellipse(particle.x, particle.y, 2);
                
                if (particle.life <= 0) {
                    particles.splice(i, 1);
                }
            }
        };
        
        p.windowResized = function() {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        };
    });
}

// Scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Parameter controls
function initializeParameterControls() {
    const learningRateSlider = document.getElementById('learning-rate');
    const learningRateValue = document.getElementById('learning-rate-value');
    const epochsSlider = document.getElementById('epochs');
    const epochsValue = document.getElementById('epochs-value');
    const batchSizeSlider = document.getElementById('batch-size');
    const batchSizeValue = document.getElementById('batch-size-value');
    
    learningRateSlider.addEventListener('input', (e) => {
        learningRateValue.textContent = parseFloat(e.target.value).toFixed(3);
        updateNetworkParameters();
    });
    
    epochsSlider.addEventListener('input', (e) => {
        epochsValue.textContent = e.target.value;
        document.getElementById('total-epochs').textContent = e.target.value;
        updateNetworkParameters();
    });
    
    batchSizeSlider.addEventListener('input', (e) => {
        batchSizeValue.textContent = e.target.value;
        updateNetworkParameters();
    });
    
    document.getElementById('activation-function').addEventListener('change', updateNetworkParameters);
    document.getElementById('optimizer').addEventListener('change', updateNetworkParameters);
}

// Dataset playground initialization
function initializeDatasetPlayground() {
    const svg = document.getElementById('dataset-svg');
    const svgRect = svg.getBoundingClientRect();
    
    svg.addEventListener('click', (e) => {
        const rect = svg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        addDataPoint(x, y, 'A');
    });
    
    svg.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const rect = svg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        addDataPoint(x, y, 'B');
    });
    
    // Initialize with empty dataset
    updateDatasetDisplay();
}

// Event listeners setup
function setupEventListeners() {
    document.getElementById('play-btn').addEventListener('click', startTraining);
    document.getElementById('pause-btn').addEventListener('click', pauseTraining);
    document.getElementById('reset-btn').addEventListener('click', resetNetwork);
}

// Network selection
function selectNetwork(networkType) {
    // Update active card
    document.querySelectorAll('.network-card').forEach(card => {
        card.classList.remove('active');
    });
    event.target.closest('.network-card').classList.add('active');
    
    currentNetwork = networkTypes[networkType];
    
    // Update UI
    document.getElementById('current-network-title').textContent = currentNetwork.name;
    document.getElementById('play-btn').disabled = false;
    document.getElementById('pause-btn').disabled = false;
    document.getElementById('reset-btn').disabled = false;
    
    // Show dataset playground for supervised learning networks
    const supervisedNetworks = ['perceptron', 'mlp', 'cnn'];
    if (supervisedNetworks.includes(networkType)) {
        document.getElementById('dataset-playground').style.display = 'block';
    } else {
        document.getElementById('dataset-playground').style.display = 'none';
    }
    
    // Show mathematical equations
    document.getElementById('math-equations').style.display = 'block';
    updateEquations();
    
    // Visualize the network
    visualizeNetwork(networkType);
    
    // Animate the transition
    anime({
        targets: '#network-container',
        scale: [0.9, 1],
        opacity: [0.7, 1],
        duration: 500,
        easing: 'easeOutQuart'
    });
}

// Network visualization
function visualizeNetwork(networkType) {
    const container = document.getElementById('network-container');
    container.innerHTML = '';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '400');
    svg.setAttribute('viewBox', '0 0 800 400');
    svg.classList.add('w-full', 'h-96');
    
    const network = networkTypes[networkType];
    const layerCount = network.nodes.length;
    const layerWidth = 800 / (layerCount + 1);
    
    // Create nodes
    const nodeElements = [];
    let nodeIndex = 0;
    
    network.nodes.forEach((nodeCount, layerIndex) => {
        const x = layerWidth * (layerIndex + 1);
        const layerHeight = 400 / (nodeCount + 1);
        
        for (let i = 0; i < nodeCount; i++) {
            const y = layerHeight * (i + 1);
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', '20');
            circle.classList.add('network-node');
            circle.setAttribute('data-node', nodeIndex);
            
            // Add hover effects
            circle.addEventListener('mouseenter', (e) => {
                showNodeInfo(e.target, nodeIndex, networkType);
            });
            
            svg.appendChild(circle);
            nodeElements.push({ x, y, element: circle });
            nodeIndex++;
        }
    });
    
    // Create connections
    if (network.connections === 'fully-connected') {
        // Create fully connected layers
        let currentNodeIndex = 0;
        for (let layerIndex = 0; layerIndex < network.nodes.length - 1; layerIndex++) {
            const currentLayerSize = network.nodes[layerIndex];
            const nextLayerSize = network.nodes[layerIndex + 1];
            
            for (let i = 0; i < currentLayerSize; i++) {
                for (let j = 0; j < nextLayerSize; j++) {
                    const fromNode = nodeElements[currentNodeIndex + i];
                    const toNode = nodeElements[currentNodeIndex + currentLayerSize + j];
                    
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', fromNode.x);
                    line.setAttribute('y1', fromNode.y);
                    line.setAttribute('x2', toNode.x);
                    line.setAttribute('y2', toNode.y);
                    line.classList.add('network-connection');
                    
                    svg.appendChild(line);
                }
            }
            currentNodeIndex += currentLayerSize;
        }
    } else if (Array.isArray(network.connections)) {
        // Create specific connections
        network.connections.forEach(([from, to]) => {
            const fromNode = nodeElements[from];
            const toNode = nodeElements[to];
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', fromNode.x);
            line.setAttribute('y1', fromNode.y);
            line.setAttribute('x2', toNode.x);
            line.setAttribute('y2', toNode.y);
            line.classList.add('network-connection');
            
            svg.appendChild(line);
        });
    }
    
    container.appendChild(svg);
    
    // Animate nodes appearing
    anime({
        targets: '.network-node',
        scale: [0, 1],
        opacity: [0, 1],
        duration: 800,
        delay: anime.stagger(100),
        easing: 'easeOutElastic(1, .8)'
    });
    
    // Animate connections
    anime({
        targets: '.network-connection',
        opacity: [0, 0.6],
        duration: 1000,
        delay: anime.stagger(50, {start: 500}),
        easing: 'easeOutQuart'
    });
}

// Show node information
function showNodeInfo(nodeElement, nodeIndex, networkType) {
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'absolute bg-gray-900 text-white p-2 rounded text-sm z-50';
    tooltip.style.left = (nodeElement.getBoundingClientRect().left + 10) + 'px';
    tooltip.style.top = (nodeElement.getBoundingClientRect().top - 40) + 'px';
    tooltip.textContent = `Node ${nodeIndex}: Activation = ${(Math.random() * 2 - 1).toFixed(3)}`;
    
    document.body.appendChild(tooltip);
    
    nodeElement.addEventListener('mouseleave', () => {
        document.body.removeChild(tooltip);
    }, { once: true });
}

// Update mathematical equations
function updateEquations() {
    const equationContent = document.getElementById('equation-content');
    equationContent.innerHTML = '';
    
    if (!currentNetwork) return;
    
    currentNetwork.equations.forEach((equation, index) => {
        const equationDiv = document.createElement('div');
        equationDiv.className = 'math-equation mb-4';
        equationDiv.innerHTML = `<div class="math-font">${equation}</div>`;
        equationContent.appendChild(equationDiv);
        
        // Animate equation appearance
        anime({
            targets: equationDiv,
            translateX: [-50, 0],
            opacity: [0, 1],
            duration: 600,
            delay: index * 200,
            easing: 'easeOutQuart'
        });
    });
}

// Training simulation
function startTraining() {
    if (!currentNetwork || trainingInProgress) return;
    
    trainingInProgress = true;
    document.getElementById('training-progress').style.display = 'block';
    document.getElementById('loss-display').style.display = 'block';
    
    // Initialize loss chart
    if (!lossChart) {
        initializeLossChart();
    }
    
    const epochs = parseInt(document.getElementById('epochs').value);
    let currentEpoch = 0;
    
    const trainingInterval = setInterval(() => {
        currentEpoch++;
        
        // Simulate training progress
        const progress = (currentEpoch / epochs) * 100;
        document.getElementById('progress-bar').style.width = progress + '%';
        document.getElementById('current-epoch').textContent = currentEpoch;
        
        // Simulate loss calculation
        const loss = Math.exp(-currentEpoch / epochs) * Math.random() * 2;
        document.getElementById('current-loss').textContent = loss.toFixed(4);
        
        // Update loss chart
        updateLossChart(currentEpoch, loss);
        
        // Animate network weights
        animateNetworkTraining();
        
        if (currentEpoch >= epochs) {
            clearInterval(trainingInterval);
            trainingInProgress = false;
            document.getElementById('play-btn').textContent = '🔄 Retrain';
        }
    }, 100);
}

function pauseTraining() {
    trainingInProgress = false;
}

function resetNetwork() {
    trainingInProgress = false;
    document.getElementById('progress-bar').style.width = '0%';
    document.getElementById('current-epoch').textContent = '0';
    document.getElementById('current-loss').textContent = '0.000';
    document.getElementById('play-btn').textContent = '▶ Train';
    
    if (lossChart) {
        lossChart.setOption({
            series: [{
                data: []
            }]
        });
    }
}

// Initialize loss chart
function initializeLossChart() {
    const chartDom = document.getElementById('loss-chart');
    lossChart = echarts.init(chartDom);
    
    const option = {
        grid: {
            left: '10%',
            right: '10%',
            top: '10%',
            bottom: '20%'
        },
        xAxis: {
            type: 'value',
            name: 'Epoch',
            nameTextStyle: { fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            name: 'Loss',
            nameTextStyle: { fontSize: 10 }
        },
        series: [{
            type: 'line',
            data: [],
            smooth: true,
            lineStyle: { color: '#00d4ff', width: 2 },
            symbol: 'none'
        }]
    };
    
    lossChart.setOption(option);
}

// Update loss chart
function updateLossChart(epoch, loss) {
    if (!lossChart) return;
    
    const option = lossChart.getOption();
    const data = option.series[0].data;
    data.push([epoch, loss]);
    
    lossChart.setOption({
        series: [{
            data: data
        }]
    });
}

// Animate network during training
function animateNetworkTraining() {
    const connections = document.querySelectorAll('.network-connection');
    const nodes = document.querySelectorAll('.network-node');
    
    // Animate connections
    anime({
        targets: connections,
        stroke: ['#2d3748', '#00d4ff', '#2d3748'],
        duration: 500,
        easing: 'easeInOutQuad'
    });
    
    // Animate nodes
    anime({
        targets: nodes,
        fill: ['#00d4ff', '#4ade80', '#00d4ff'],
        duration: 800,
        easing: 'easeInOutQuad'
    });
}

// Update network parameters
function updateNetworkParameters() {
    if (!currentNetwork) return;
    
    const learningRate = document.getElementById('learning-rate').value;
    const epochs = document.getElementById('epochs').value;
    const batchSize = document.getElementById('batch-size').value;
    const activation = document.getElementById('activation-function').value;
    const optimizer = document.getElementById('optimizer').value;
    
    // Update network visualization based on parameters
    const connections = document.querySelectorAll('.network-connection');
    const opacity = Math.min(1, learningRate * 100);
    
    connections.forEach(conn => {
        conn.style.opacity = opacity;
    });
}

// Dataset management
function addDataPoint(x, y, classLabel) {
    const point = {
        x: x,
        y: y,
        class: classLabel,
        id: dataset.length
    };
    
    dataset.push(point);
    updateDatasetDisplay();
    updateDatasetStats();
}

function updateDatasetDisplay() {
    const svg = document.getElementById('dataset-svg');
    const svgRect = svg.getBoundingClientRect();
    
    // Clear existing points
    svg.querySelectorAll('.data-point').forEach(point => point.remove());
    
    // Add points
    dataset.forEach(point => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', point.x);
        circle.setAttribute('cy', point.y);
        circle.setAttribute('r', '6');
        circle.classList.add('data-point');
        circle.setAttribute('data-id', point.id);
        
        if (point.class === 'A') {
            circle.setAttribute('fill', '#3b82f6');
        } else {
            circle.setAttribute('fill', '#ef4444');
        }
        
        // Add click to remove
        circle.addEventListener('click', (e) => {
            e.stopPropagation();
            removeDataPoint(point.id);
        });
        
        svg.appendChild(circle);
    });
    
    // Animate new points
    anime({
        targets: '.data-point',
        scale: [0, 1],
        duration: 300,
        easing: 'easeOutBack'
    });
}

function removeDataPoint(id) {
    dataset = dataset.filter(point => point.id !== id);
    updateDatasetDisplay();
    updateDatasetStats();
}

function updateDatasetStats() {
    const totalPoints = dataset.length;
    const classACount = dataset.filter(p => p.class === 'A').length;
    const classBCount = dataset.filter(p => p.class === 'B').length;
    
    document.getElementById('total-points').textContent = totalPoints;
    document.getElementById('class-a-count').textContent = classACount;
    document.getElementById('class-b-count').textContent = classBCount;
}

function loadDataset(type) {
    dataset = [];
    const svg = document.getElementById('dataset-svg');
    const width = 800;
    const height = 400;
    
    switch (type) {
        case 'xor':
            // XOR pattern
            addDataPoint(100, 100, 'A');
            addDataPoint(300, 300, 'A');
            addDataPoint(100, 300, 'B');
            addDataPoint(300, 100, 'B');
            break;
            
        case 'linear':
            // Linearly separable
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const classLabel = y > x * 0.5 + 50 ? 'B' : 'A';
                addDataPoint(x, y, classLabel);
            }
            break;
            
        case 'circular':
            // Circular pattern
            for (let i = 0; i < 30; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 150 + 50;
                const x = width/2 + Math.cos(angle) * radius;
                const y = height/2 + Math.sin(angle) * radius;
                const classLabel = radius > 120 ? 'B' : 'A';
                addDataPoint(x, y, classLabel);
            }
            break;
    }
}

function clearDataset() {
    dataset = [];
    updateDatasetDisplay();
    updateDatasetStats();
}

// Smooth scrolling
function scrollToNetworks() {
    document.getElementById('networks').scrollIntoView({
        behavior: 'smooth'
    });
}

// Utility functions
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

function relu(x) {
    return Math.max(0, x);
}

function tanh(x) {
    return Math.tanh(x);
}

// Export functions for global access
window.selectNetwork = selectNetwork;
window.loadDataset = loadDataset;
window.clearDataset = clearDataset;
window.scrollToNetworks = scrollToNetworks;