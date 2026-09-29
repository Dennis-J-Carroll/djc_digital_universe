/* Recent, source-linked architectures. Loaded before DOMContentLoaded, after inline registries. */
Object.assign(networkTypes, {
    dit: {
        name: 'Diffusion Transformer (DiT)',
        description: 'A Transformer denoiser over latent image patches replaces the U-Net in a diffusion model.',
        equations: ['z_t=\\sqrt{\\bar\\alpha_t}z_0+\\sqrt{1-\\bar\\alpha_t}\\epsilon', 'H=\\operatorname{Transformer}(\\operatorname{Patchify}(z_t),t,c)', 'L=\\mathbb E\\|\\epsilon-\\epsilon_\\theta(z_t,t,c)\\|^2'],
        nodes: [3, 4, 3], connections: 'fully-connected', complexity: 'O(T P²) attention', invented: 2023, color: '#648bbc',
        papers: [{ title: 'Scalable Diffusion Models with Transformers', authors: 'W. Peebles & S. Xie', year: 2023, url: 'https://arxiv.org/abs/2212.09748' }],
        recentStages: [['Noisy latent', 'Sample one diffusion timestep'], ['Patch embedding', 'Split image latent into tokens'], ['Conditioned Transformer', 'Attention with timestep and class'], ['Noise prediction', 'Predict noise for denoising']]
    },
    mamba2: {
        name: 'Mamba-2 / SSD',
        description: 'Selective state-space layers use structured state space duality for chunked training and recurrent decoding.',
        equations: ['h_t=a_t h_{t-1}+b_t x_t', 'y_t=c_t h_t', 'M_{ij}=c_i\\left(\\prod_{k=j+1}^{i}a_k\\right)b_j\\quad (i\\ge j)'],
        nodes: [3, 4, 3], connections: 'state-space', complexity: 'O(N) sequence', invented: 2024, color: '#648bbc',
        papers: [{ title: 'Transformers are SSMs: Generalized Models and Efficient Algorithms Through Structured State Space Duality', authors: 'T. Dao & A. Gu', year: 2024, url: 'https://arxiv.org/abs/2405.21060' }],
        recentStages: [['Token projection', 'Produce input-dependent terms'], ['Selective SSM', 'Update compressed state'], ['Chunkwise SSD', 'Use matrix products in training'], ['Readout', 'Project state to output']]
    },
    jamba: {
        name: 'Jamba Hybrid',
        description: 'Alternates Mamba sequence layers and attention layers, with sparse mixture-of-experts feedforward blocks.',
        equations: ['h^{(l+1)}=\\operatorname{Mamba}(h^{(l)})\\text{ or }\\operatorname{Attention}(h^{(l)})', 'y=\\sum_{i\\in\\operatorname{TopK}(g(x))}p_i E_i(x)'],
        nodes: [3, 4, 3], connections: 'fully-connected', complexity: 'Mixed scan + attention', invented: 2024, color: '#648bbc',
        papers: [{ title: 'Jamba: A Hybrid Transformer-Mamba Language Model', authors: 'O. Lieber et al.', year: 2024, url: 'https://arxiv.org/abs/2403.19887' }],
        recentStages: [['Tokens', 'Embed context'], ['Mamba blocks', 'Compress long-range sequence state'], ['Attention blocks', 'Direct token retrieval'], ['Sparse experts', 'Route token to selected FFNs'], ['Output', 'Predict next token']]
    },
    ttt: {
        name: 'Test-Time Training (TTT)',
        description: 'A sequence layer stores context in small model weights updated by a self-supervised gradient step at each token.',
        equations: ['W_t=W_{t-1}-\\eta\\nabla_W\\ell(W_{t-1};x_t)', 'y_t=f_{W_t}(q_t)'],
        nodes: [3, 4, 3], connections: 'recurrent', complexity: 'O(N) steps + inner updates', invented: 2024, color: '#648bbc',
        papers: [{ title: 'Learning to (Learn at Test Time): RNNs with Expressive Hidden States', authors: 'Y. Sun et al.', year: 2024, url: 'https://arxiv.org/abs/2407.04620' }],
        recentStages: [['Token', 'Construct self-supervised target'], ['Inner loss', 'Measure memory prediction error'], ['Weight update', 'Gradient step changes hidden model'], ['Query', 'Read updated memory']]
    },
    titans: {
        name: 'Titans Neural Memory',
        description: 'Combines short-term attention with long-term neural memory updated during inference.',
        equations: ['M_t=M_{t-1}-\\eta_t\\nabla_M\\ell(M_{t-1};x_t)', 'y_t=\\operatorname{Attention}(x_t,\\text{short-term context},M_t)'],
        nodes: [3, 4, 3], connections: 'recurrent', complexity: 'Attention + memory updates', invented: 2025, color: '#648bbc',
        papers: [{ title: 'Titans: Learning to Memorize at Test Time', authors: 'A. Behrouz et al.', year: 2025, url: 'https://arxiv.org/abs/2501.00663' }],
        recentStages: [['Input segment', 'Represent current context'], ['Short-term attention', 'Retrieve precise local tokens'], ['Neural memory', 'Update long-term weights'], ['Readout', 'Mix local and stored context']]
    }
});

Object.assign(architectureDetails, {
    dit: {
        theory: 'DiT retains the diffusion objective but replaces a convolutional U-Net denoiser with a Transformer over patches of a compressed image latent. Timestep and class conditioning modulate Transformer blocks. Patch count P controls quadratic attention work per denoising step; sampling still needs multiple steps.',
        eqNotes: ['Noising creates a training target at timestep t.', 'Patchify maps spatial latent into a token sequence; conditioning changes block activations.', 'The model learns to predict sampled Gaussian noise.'],
        variants: ['DiT-XL/2', 'Latent diffusion', 'Adaptive layer normalization'],
        applications: [{ task: 'Image generation', data: 'Class-conditional ImageNet', note: 'Patch size trades token count for detail' }],
        pitfalls: ['Full attention scales quadratically with patch count.', 'Denoising steps add latency beyond a single Transformer pass.', 'This page shows a schematic, not a trained DiT.']
    },
    mamba2: {
        theory: 'Mamba-2 uses a structured state-space dual view. With scalar state transitions, its recurrent sequence transform is a semiseparable causal matrix. Chunked matrix multiplication raises arithmetic intensity during training; recurrent state keeps decoding memory bounded by state size. The paper reports speedup for the core layer, not every end-to-end model.',
        eqNotes: ['A token changes a compact hidden state.', 'Readout projects current state into output features.', 'Matrix entry factors into output, transition products, and input terms for past token j.'],
        variants: ['Mamba-1', 'Structured State Space Duality', 'Chunkwise SSD'],
        applications: [{ task: 'Long-sequence modeling', data: 'Language and sequence data', note: 'Bounded recurrent state at decode time' }],
        pitfalls: ['Compressed state can lose exact token details.', 'Hardware speed depends on chunk size and kernel implementation.', 'SSD duality applies to structured attention, not arbitrary softmax attention.']
    },
    jamba: {
        theory: 'Jamba mixes Mamba and attention layers, then routes feedforward work through selected experts. Mamba supplies compressed sequence state; attention retrieves specific earlier tokens; top-k routing spends compute on few experts. Attention still needs a KV cache where used.',
        eqNotes: ['A hybrid stack selects different sequence operators by layer.', 'A router selects a subset of experts and combines their weighted outputs.'],
        variants: ['Mamba-attention hybrid', 'Sparse mixture of experts'],
        applications: [{ task: 'Long-context language modeling', data: 'Text sequences', note: 'Balances recurrent compression and direct retrieval' }],
        pitfalls: ['Attention blocks retain context-dependent KV memory.', 'Expert routing adds load-balancing and memory costs.', 'One complexity number cannot describe all blocks.']
    },
    ttt: {
        theory: 'TTT replaces a fixed vector hidden state with the weights of a small inner model. Each token provides a self-supervised loss; an update writes into those weights, and a query reads them. Training unrolls these inner updates. The inner model has fixed parameter size, but each update has compute and memory traffic.',
        eqNotes: ['Self-supervised gradient descent writes context into hidden weights.', 'The updated inner model responds to a query projection.'],
        variants: ['TTT-Linear', 'TTT-MLP'],
        applications: [{ task: 'Adaptive sequence memory', data: 'Long text streams', note: 'State can adapt without growing token cache' }],
        pitfalls: ['Inner gradients add per-token compute.', 'A fixed-size memory can still overwrite old information.', 'Toy loss curves on this page are illustrative.']
    },
    titans: {
        theory: 'Titans combines short-term attention with a neural long-term memory. Local attention gives precise retrieval over nearby context. A test-time learning rule updates memory weights for information intended to persist. Performance and million-token context claims depend on the model and benchmark setting.',
        eqNotes: ['A test-time gradient step writes into persistent memory weights.', 'A schematic readout combines local attention and learned memory.'],
        variants: ['Memory as Context', 'Memory as Gate', 'Memory as Layer'],
        applications: [{ task: 'Long-context language modeling', data: 'Long text sequences', note: 'Local attention plus learned long-term storage' }],
        pitfalls: ['Memory updates add compute and can overwrite prior contents.', 'A local window still has attention cost.', 'The diagram is conceptual; it does not implement Titans inference.']
    }
});

function buildRecentArchitectureSVG(network) {
    var stages = network.recentStages || [];
    var width = 700;
    var gap = 12;
    var boxWidth = Math.max(105, (width - 60 - gap * (stages.length - 1)) / stages.length);
    var cells = stages.map(function(stage, index) {
        var x = 30 + index * (boxWidth + gap);
        var lines = stage[0].match(/.{1,18}(?:\s|$)/g) || [stage[0]];
        var label = lines.slice(0, 2).map(function(line, n) {
            return '<text x="' + (x + boxWidth / 2) + '" y="' + (114 + n * 16) + '" text-anchor="middle" fill="#29475f" font-size="12" font-weight="600">' + line.trim() + '</text>';
        }).join('');
        return '<rect x="' + x + '" y="78" width="' + boxWidth + '" height="86" rx="8" fill="#e8f1f7" stroke="#648bbc"/>' + label +
            (index ? '<path d="M ' + (x - gap + 2) + ' 121 h ' + (gap - 4) + '" stroke="#526a80" stroke-width="2"/>' : '');
    }).join('');
    return '<svg viewBox="0 0 700 250" width="100%" height="250" role="img" aria-label="' + network.name + ' conceptual stages">' +
        '<rect width="700" height="250" fill="#f8fafc" rx="8"/>' +
        '<text x="30" y="37" fill="#29475f" font-size="13" font-weight="700">Conceptual architecture</text>' +
        '<text x="30" y="58" fill="#526a80" font-size="11">Training trace below is illustrative; these blocks are not trained here.</text>' + cells + '</svg>';
}

/* Builder blocks model data flow only. Full advanced model kernels are outside this browser demo. */
function mutedBlockIcon(path) {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
}

Object.assign(layerDefinitions, {
    tokenize: {
        name: 'Token Embed', icon: mutedBlockIcon('<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="1" fill="#fff"/>'),
        color: '#526a80', units: 256, hasUnits: true, unitLabel: 'width', activation: false,
        description: 'Maps discrete sequence tokens to vectors. Shape becomes N × T × d, where T is token count and d is model width.'
    },
    patchify: {
        name: 'Patch Embed', icon: mutedBlockIcon('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18M3 12h18"/>'),
        color: '#526a80', units: 256, hasUnits: true, unitLabel: 'width', activation: false,
        description: 'Splits an image latent into patches and projects each patch to a token. Smaller patches increase token count P and attention cost.'
    },
    ssm2: {
        name: 'SSD / Mamba-2', icon: mutedBlockIcon('<path d="M3 12h4l3-5 4 10 3-5h4"/><path d="M18 8h3v8h-3"/>'),
        color: '#526a80', units: 256, hasUnits: true, unitLabel: 'state width', activation: false,
        description: 'Selective state-space recurrence compresses earlier tokens into state. Mamba-2 trains with chunkwise matrix products and decodes recurrently.'
    },
    moe: {
        name: 'Top-K MoE', icon: mutedBlockIcon('<path d="M4 4v16M4 12h5m0 0 5-7m-5 7 5 7M14 5h6M14 19h6"/>'),
        color: '#526a80', units: 4, hasUnits: true, unitLabel: 'experts', activation: false,
        description: 'A router selects a few feedforward experts per token. Sparse compute does not mean all expert weights disappear from memory.'
    },
    ttt: {
        name: 'TTT Memory', icon: mutedBlockIcon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 12h10M12 7v10"/>'),
        color: '#526a80', units: 128, hasUnits: true, unitLabel: 'inner width', activation: false,
        description: 'An inner model uses a self-supervised gradient step to write token context into hidden weights, then answers a query.'
    },
    memory: {
        name: 'Neural Memory', icon: mutedBlockIcon('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
        color: '#526a80', units: 128, hasUnits: true, unitLabel: 'memory width', activation: false,
        description: 'Titans-style long-term memory updates learned weights at test time; short-term attention handles nearby exact retrieval.'
    },
    adaln: {
        name: 'AdaLN', icon: mutedBlockIcon('<path d="M3 6h18M3 12h18M3 18h18"/><circle cx="8" cy="6" r="2" fill="#526a80"/><circle cx="15" cy="12" r="2" fill="#526a80"/>'),
        color: '#526a80', units: 0, hasUnits: false, activation: false,
        description: 'Adaptive layer normalization modulates token features with timestep or class conditioning in DiT blocks.'
    }
});

Object.assign(layerDefinitions, {
    input: Object.assign(layerDefinitions.input, { description: 'Supplies batch data. Choose token embedding for language or patch embedding for image latents.' }),
    dense: Object.assign(layerDefinitions.dense, { description: 'Computes y = φ(Wx + b); matrix multiplication cost and parameters grow with input and output width.' }),
    conv2d: Object.assign(layerDefinitions.conv2d, { description: 'Slides shared kernels over an image grid to produce local feature maps.' }),
    maxpool: Object.assign(layerDefinitions.maxpool, { description: 'Downsamples spatial feature maps by selecting local maxima.' }),
    lstm: Object.assign(layerDefinitions.lstm, { description: 'Uses input, forget, and output gates to update recurrent cell state.' }),
    attention: Object.assign(layerDefinitions.attention, { description: 'Forms query-key scores, softmax weights, then weighted values. Full sequence attention uses quadratic token interactions.' }),
    dropout: Object.assign(layerDefinitions.dropout, { description: 'Randomly masks activations during training as regularization.' }),
    batchnorm: Object.assign(layerDefinitions.batchnorm, { description: 'Normalizes activations across a mini-batch, then learns scale and shift.' }),
    flatten: Object.assign(layerDefinitions.flatten, { description: 'Reshapes spatial or sequence features into one vector without learning weights.' }),
    output: Object.assign(layerDefinitions.output, { description: 'Maps final representation to task outputs. A sequence model normally selects or pools tokens first.' })
});

var recentPalette = [
    ['tokenize', 'Token Embed'], ['patchify', 'Patch Embed'], ['ssm2', 'SSD / Mamba-2'],
    ['moe', 'Top-K MoE'], ['ttt', 'TTT Memory'], ['memory', 'Neural Memory'], ['adaln', 'AdaLN']
];
var paletteHost = document.getElementById('builder-palette');
if (paletteHost) {
    recentPalette.forEach(function(entry) {
        var block = document.createElement('div');
        block.className = 'palette-item';
        block.draggable = true;
        block.dataset.layerType = entry[0];
        block.setAttribute('role', 'button');
        block.tabIndex = 0;
        block.setAttribute('aria-label', 'Add ' + entry[1] + ' layer');
        block.title = layerDefinitions[entry[0]].description;
        block.innerHTML = '<div class="layer-icon">' + layerDefinitions[entry[0]].icon + '</div><span>' + entry[1] + '</span>';
        paletteHost.appendChild(block);
    });
}

var builderPresets = {
    dit: {
        label: 'DiT · 2023', layers: ['input', 'patchify', 'adaln', 'attention', 'dense', 'output'],
        note: 'Image latent → patch tokens → conditioned Transformer denoiser. Smaller patches raise attention work roughly with P² per step. This schematic omits repeated DiT blocks and diffusion sampling.'
    },
    mamba2: {
        label: 'Mamba-2 · 2024', layers: ['input', 'tokenize', 'ssm2', 'ssm2', 'output'],
        note: 'Token embedding → stacked selective state-space blocks → output. Recurrent decoding keeps a fixed-size state; chunkwise SSD raises training hardware efficiency.'
    },
    jamba: {
        label: 'Jamba · 2024', layers: ['input', 'tokenize', 'ssm2', 'attention', 'moe', 'output'],
        note: 'Mamba state compression + direct attention retrieval + sparse experts. Attention layers still keep KV context; only selected experts run for each token.'
    },
    ttt: {
        label: 'TTT · 2024', layers: ['input', 'tokenize', 'ttt', 'output'],
        note: 'A self-supervised inner gradient step writes token information into model weights. Fixed-size hidden weights avoid a growing cache but cost compute at every update.'
    },
    titans: {
        label: 'Titans · 2025', layers: ['input', 'tokenize', 'attention', 'memory', 'output'],
        note: 'Local attention handles precise short-term context; learned neural memory stores longer-range information through test-time updates. This is a block-level sketch.'
    }
};

function loadBuilderPreset(key) {
    var preset = builderPresets[key];
    if (!preset) return;
    clearBuilder();
    preset.layers.forEach(function(type) { addBuilderLayer(type); });
    activeBuilderPreset = key;
    document.getElementById('builder-preset-description').textContent = preset.note;
    document.getElementById('builder-layer-explanation').textContent = preset.label + ': ' + preset.note;
    document.getElementById('builder-workspace').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.addEventListener('DOMContentLoaded', function() {
    var presetHost = document.getElementById('builder-presets');
    if (!presetHost) return;
    Object.entries(builderPresets).forEach(function(entry) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'builder-preset';
        button.textContent = entry[1].label;
        button.addEventListener('click', function() { loadBuilderPreset(entry[0]); });
        presetHost.appendChild(button);
    });
});

/* Each glossary entry has a compact equation, mechanics, and concrete example. */
Object.assign(glossary, {
    'Diffusion Transformer': 'A Transformer denoiser over latent image patches, conditioned on a diffusion timestep and often a class or text signal.',
    'Structured State Space Duality': 'A dual view of selective state-space recurrence as a structured causal matrix, used by Mamba-2.',
    'Test-time training': 'Updating an inner model on self-supervised input during inference so its weights act as sequence memory.',
    'Mixture of experts': 'A router selects a small subset of feedforward expert networks for each token.',
    'Patch embedding': 'Dividing an image or latent grid into patches and linearly projecting each patch into a token vector.',
    'KV cache': 'Stored attention keys and values from earlier tokens, reused during autoregressive decoding.',
    'Neural memory': 'A learned model whose weights can be updated at inference time to retain information across longer context.',
    'Local learning coefficient': 'A singular-learning quantity measuring effective loss geometry near a parameter region rather than raw parameter count.',
    'Cross-layer transcoder': 'A sparse surrogate for MLP computations that maps features across model layers for circuit analysis.',
    'Hopfield retrieval': 'Associative-memory update that selects stored patterns using softmax-weighted similarity to a query.',
    'Equilibrium propagation': 'Learning rule for certain energy-based networks that compares free and weakly nudged equilibrium states.'
});

window.neuralGlossaryDetails = {
    'Activation function': ['a=\\phi(Wx+b)', 'Nonlinearity acts after an affine map. Without nonlinear activations, stacked dense matrices collapse into one matrix.', 'For z = -2, ReLU(z) = 0; for z = 3, ReLU(z) = 3.'],
    'Backpropagation': ['\\frac{\\partial L}{\\partial W_l}=\\frac{\\partial L}{\\partial h_l}\\frac{\\partial h_l}{\\partial W_l}', 'The chain rule moves loss sensitivity backward through each operation; matrix gradients then update weights.', 'If one weight raises loss by 0.2 per unit, a small negative step lowers loss.'],
    'Batch normalization': ['\\hat x=(x-\\mu_B)/\\sqrt{\\sigma_B^2+\\epsilon},\\quad y=\\gamma\\hat x+\\beta', 'Batch statistics standardize activations; learned scale and shift restore needed ranges. Small epsilon prevents division by zero.', 'A batch with mean 10 and standard deviation 2 maps value 12 near +1 before scaling.'],
    'Bias-variance tradeoff': ['\\mathbb E[(\\hat f-f)^2]=\\operatorname{Bias}^2+\\operatorname{Var}+\\sigma^2', 'Expected squared prediction error can be split into systematic bias, training-set sensitivity, and irreducible noise under standard assumptions.', 'A straight line underfits curved data; a high-degree polynomial may fit noise.'],
    'Convolution': ['y_{i,j}=\\sum_{u,v,c}K_{u,v,c}x_{i+u,j+v,c}', 'A shared kernel computes local dot products at every location. Weight sharing keeps parameter count below an equivalent dense image map.', 'A 3×3 edge filter responds strongly where neighboring pixels change sharply.'],
    'Cross-entropy': ['L=-\\sum_c y_c\\log p_c', 'The loss penalizes low probability on the true class; gradients flow through softmax logits during classification.', 'True class probability 0.9 gives loss about 0.105; probability 0.1 gives about 2.303.'],
    'Decision boundary': ['f(x)=0', 'A binary classifier changes its predicted label where its score crosses zero; nonlinear features bend that surface.', 'For f(x)=x_1+x_2-1, the boundary is a straight line x₁+x₂=1.'],
    'Dropout': ['\\tilde h_i=m_i h_i/(1-p),\\quad m_i\\sim\\operatorname{Bernoulli}(1-p)', 'Training masks activations at random and rescales survivors; evaluation normally uses all units without masks.', 'At p=0.5, a surviving activation 3 becomes 6 during training.'],
    'Epoch': ['\\text{steps per epoch}=\\lceil N/B\\rceil', 'One epoch visits the training set once, often split into mini-batches; it does not imply one parameter update.', 'With 1,000 examples and batch size 100, an epoch has 10 optimizer steps.'],
    'Feature map': ['F_k=K_k*x', 'Each convolutional filter produces a spatial grid of responses showing where one learned pattern activates.', 'One map lights up along vertical edges; another along horizontal edges.'],
    'Gradient descent': ['\\theta_{t+1}=\\theta_t-\\eta\\nabla_\\theta L(\\theta_t)', 'The gradient points toward local increase in loss; subtracting it gives a local downhill update.', 'Gradient 4 with learning rate 0.1 changes a weight from 2 to 1.6.'],
    'Kernel': ['(K*x)_{i,j}=\\sum_{u,v}K_{u,v}x_{i+u,j+v}', 'In a CNN, a small weight grid slides across an image. Kernel methods use the same word for a separate similarity function.', 'A 3×3 blur kernel averages nine neighboring pixel values.'],
    'Learning rate': ['\\Delta\\theta=-\\eta\\nabla_\\theta L', 'The learning rate scales every optimizer step. Stability depends on curvature, optimizer, batch, and normalization.', 'With gradient 10, η=0.01 gives a 0.1 step; η=1 gives a 10 step.'],
    'Loss function': ['L(\\theta)=\\frac1N\\sum_{i=1}^N\\ell(f_\\theta(x_i),y_i)', 'Loss compresses prediction quality into a scalar objective. Its derivative supplies the training signal.', 'Mean squared error for targets [0,1] and predictions [0,0.8] is 0.02.'],
    'Overfitting': ['L_{\\text{test}}-L_{\\text{train}}>0', 'A large generalization gap can signal memorization of training-specific patterns; some gap is normal.', 'A model scores 99% on training images but 60% on held-out images.'],
    'Parameter': ['y=Wx+b', 'Weights and biases are learnable numbers. Their shape controls storage and multiplication work.', 'A dense layer mapping 10 inputs to 4 outputs has 10×4 weights plus 4 biases.'],
    'Pooling': ['y_{i,j}=\\max_{(u,v)\\in\\mathcal W_{i,j}}x_{u,v}', 'Pooling summarizes a local window and reduces spatial resolution without learned weights.', 'Max pooling a 2×2 window [1,3;2,0] returns 3.'],
    'Regularization': ['L_{\\text{total}}=L_{\\text{data}}+\\lambda\\|W\\|_2^2', 'A penalty or training procedure discourages overly complex fits and can improve held-out error.', 'Weight decay pushes large weights down while fitting labels.'],
    'Residual connection': ['y=x+F(x)', 'An identity path bypasses a learned block, giving gradients a direct route through deep networks.', 'If F(x)=0 early in training, the block still passes x through unchanged.'],
    'Softmax': ['p_i=e^{z_i}/\\sum_j e^{z_j}', 'Exponentials turn logits into positive normalized weights. Stable implementations subtract the maximum logit first.', 'Logits [0,0] produce probabilities [0.5,0.5].'],
    'Stride': ['H_{\\text{out}}=\\lfloor(H+2P-K)/S\\rfloor+1', 'Stride S is the shift between neighboring convolution windows; larger S produces fewer output positions.', 'A 5-wide input, 3-wide kernel, no padding, stride 2 gives 2 output positions.'],
    'Transfer learning': ['\\theta_{\\text{task}}\\leftarrow\\theta_{\\text{pretrained}}-\\eta\\nabla L_{\\text{task}}', 'Pretrained weights supply useful features; task data updates some or all of them.', 'Fine-tune an image encoder on a small plant-disease dataset.'],
    'Underfitting': ['L_{\\text{train}}\\text{ high},\\quad L_{\\text{test}}\\text{ high}', 'The model cannot capture enough structure even on training data; capacity, features, or training time may be insufficient.', 'A linear separator fails on an XOR dataset.'],
    'Weight initialization': ['\\operatorname{Var}(W)\\approx 2/n_{\\text{in}}', 'Initialization chooses starting weight scale so signals and gradients neither vanish nor explode across layers.', 'He initialization uses variance near 2/fan-in for ReLU layers.'],
    'Diffusion process': ['x_t=\\sqrt{\\bar\\alpha_t}x_0+\\sqrt{1-\\bar\\alpha_t}\\epsilon', 'A forward process adds noise; a learned reverse model predicts how to remove it at each step.', 'Noise a clean image at timestep 300, then train a denoiser to predict sampled noise.'],
    'ELBO (Evidence Lower Bound)': ['\\mathcal L_{\\text{ELBO}}=\\mathbb E_q[\\log p(x|z)]-D_{\\mathrm{KL}}(q(z|x)\\|p(z))', 'A VAE maximizes reconstruction likelihood while keeping its latent posterior near the prior.', 'An encoder that reconstructs perfectly but strays far from the prior pays a KL penalty.'],
    'KL divergence': ['D_{\\mathrm{KL}}(p\\|q)=\\sum_x p(x)\\log\\frac{p(x)}{q(x)}', 'KL measures expected log-density difference under p. It is asymmetric and nonnegative when defined.', 'Identical distributions have KL 0; p=[1,0], q=[0.5,0.5] gives log 2.'],
    'Latent space': ['z=E_\\phi(x),\\quad \\hat x=D_\\theta(z)', 'An encoder maps raw data to a smaller representation; a decoder or prediction head reads it.', 'Interpolate between two image latents to vary pose or lighting smoothly.'],
    'Reparameterization trick': ['z=\\mu+\\sigma\\odot\\epsilon,\\quad\\epsilon\\sim\\mathcal N(0,I)', 'Sampling noise separately keeps z differentiable with respect to learned mean and scale.', 'For μ=2, σ=0.5, ε=-1, sampled z is 1.5.'],
    'State-space model': ['h_t=A_t h_{t-1}+B_t x_t,\\quad y_t=C_t h_t', 'A recurrent state compresses sequence history. Selective models let transition and readout depend on input.', 'A high forget factor keeps earlier token influence across many steps.'],
    'Diffusion Transformer': ['H=\\operatorname{Transformer}(\\operatorname{Patchify}(z_t),t,c)', 'DiT performs denoising in latent space. Patch tokens enter timestep-conditioned Transformer blocks.', 'Split a 32×32 latent into 4×4 patches: 64 tokens enter attention.'],
    'Structured State Space Duality': ['M_{ij}=C_i\\left(\\prod_{k=j+1}^{i}A_k\\right)B_j', 'Under its structured transition assumptions, a recurrence yields a causal matrix with factored past-token effects.', 'For scalar A=0.5, a token two steps ago contributes a factor of 0.25 before projections.'],
    'Test-time training': ['W_t=W_{t-1}-\\eta\\nabla_W\\ell(W_{t-1};x_t)', 'An inner model learns from current unlabeled context; its changed weights serve as hidden memory.', 'A token-specific prediction error updates small memory weights before the next token arrives.'],
    'Mixture of experts': ['y=\\sum_{i\\in\\operatorname{TopK}(g(x))}p_iE_i(x)', 'A router picks a few experts for each token, limiting active computation while retaining many total weights.', 'With 8 experts and top-2 routing, one token executes only 2 expert FFNs.'],
    'Patch embedding': ['Z=\\operatorname{reshape}(X)W_E', 'Nonoverlapping image patches become token vectors through a learned projection.', 'A 16×16 image with 4×4 patches becomes 16 tokens.'],
    'KV cache': ['K_{1:t}=[K_{1:t-1};k_t],\\quad V_{1:t}=[V_{1:t-1};v_t]', 'Autoregressive attention stores old key and value tensors so each new token avoids recomputing them.', 'At step 100, a new query attends to 100 cached keys and values.'],
    'Neural memory': ['M_t=M_{t-1}-\\eta_t\\nabla_M\\ell_t', 'A learned memory can update its weights during inference. This trades fixed memory size for per-update work and possible overwrites.', 'A long document changes memory weights while local attention keeps recent sentences exact.'],
    'Local learning coefficient': ['F_n\\approx nL_n+\\lambda\\log n', 'In singular learning theory, λ describes local Bayesian evidence scaling; regular models have λ=d/2.', 'Two parameter regions with equal training loss can differ in effective local complexity.'],
    'Cross-layer transcoder': ['\\widehat y^{(l)}=D^{(l)}\\operatorname{sparse}(E x)', 'A sparse surrogate approximates MLP outputs using features that can be traced across layers; approximation error limits conclusions.', 'A feature for a quoted phrase contributes to later factual-answer features in an attribution graph.'],
    'Hopfield retrieval': ['x_{\\text{new}}=X\\operatorname{softmax}(\\beta X^\\top x)', 'A query scores stored patterns and returns their softmax-weighted combination under the specified modern Hopfield setup.', 'A query closest to one stored pattern receives its largest retrieval weight.'],
    'Equilibrium propagation': ['\\Delta W\\propto-(\\partial_W E_{\\text{nudged}}-\\partial_W E_{\\text{free}})/\\beta', 'For suitable energy-based systems, contrasting a free fixed point with a slightly target-nudged one approximates a learning gradient.', 'A settled circuit is nudged toward a correct label; local state changes drive weight updates.']
};
