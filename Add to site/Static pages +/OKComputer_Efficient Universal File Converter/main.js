// File Converter Pro - Main JavaScript Functionality
// Comprehensive file conversion engine with extreme usability

class FileConverterPro {
    constructor() {
        this.currentFile = null;
        this.conversionHistory = this.loadHistory();
        this.userSettings = this.loadSettings();
        this.batchQueue = [];
        this.isProcessing = false;
        this.supportedFormats = this.getSupportedFormats();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeUI();
        this.setupAnimations();
        this.loadUserPreferences();
        
        // Initialize page-specific functionality
        const currentPage = this.getCurrentPage();
        switch(currentPage) {
            case 'index':
                this.initMainConverter();
                break;
            case 'batch':
                this.initBatchConverter();
                break;
            case 'history':
                this.initHistoryViewer();
                break;
            case 'help':
                this.initHelpViewer();
                break;
        }
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('batch.html')) return 'batch';
        if (path.includes('history.html')) return 'history';
        if (path.includes('help.html')) return 'help';
        return 'index';
    }
    
    setupEventListeners() {
        // Global event listeners
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeComponents();
        });
        
        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Scroll reveal animations
        window.addEventListener('scroll', () => this.handleScrollReveal());
    }
    
    initializeUI() {
        // Initialize typewriter effect for hero text
        const heroText = document.getElementById('hero-text');
        if (heroText) {
            const typed = new Typed('#hero-text', {
                strings: ['Convert Any File Type', 'Transform Your Data', 'Batch Process Files'],
                typeSpeed: 50,
                backSpeed: 30,
                backDelay: 2000,
                loop: true,
                showCursor: false
            });
        }
        
        // Initialize scroll reveal
        this.setupScrollReveal();
    }
    
    setupAnimations() {
        // Animate statistics on scroll
        const statsCards = document.querySelectorAll('.stats-card');
        statsCards.forEach((card, index) => {
            anime({
                targets: card,
                translateY: [30, 0],
                opacity: [0, 1],
                delay: index * 100,
                duration: 600,
                easing: 'easeOutQuart'
            });
        });
    }
    
    setupScrollReveal() {
        const revealElements = document.querySelectorAll('.scroll-reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });
        
        revealElements.forEach(el => observer.observe(el));
    }
    
    handleScrollReveal() {
        // Additional scroll-based animations can be added here
    }
    
    // ==================== MAIN CONVERTER FUNCTIONALITY ====================
    
    initMainConverter() {
        this.setupFileDragDrop();
        this.setupFormatSelection();
        this.setupConversionControls();
        this.loadRecentConversions();
        this.initializeChart();
    }
    
    setupFileDragDrop() {
        const dragZone = document.getElementById('dragZone');
        const fileInput = document.getElementById('fileInput');
        
        if (!dragZone || !fileInput) return;
        
        // Drag and drop events
        dragZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dragZone.classList.add('dragover');
        });
        
        dragZone.addEventListener('dragleave', () => {
            dragZone.classList.remove('dragover');
        });
        
        dragZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dragZone.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                this.handleFileSelection(files[0]);
            }
        });
        
        // Click to browse
        dragZone.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelection(e.target.files[0]);
            }
        });
    }
    
    handleFileSelection(file) {
        this.currentFile = file;
        
        // Display file info
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        
        if (fileInfo && fileName && fileSize) {
            fileName.textContent = file.name;
            fileSize.textContent = this.formatFileSize(file.size);
            fileInfo.classList.remove('hidden');
            
            // Animate file info appearance
            anime({
                targets: fileInfo,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 400,
                easing: 'easeOutQuart'
            });
        }
        
        // Auto-detect format
        const detectedFormat = this.detectFileFormat(file.name);
        this.updateFormatSelection(detectedFormat);
        
        // Enable convert button
        const convertBtn = document.getElementById('convertBtn');
        if (convertBtn) {
            convertBtn.disabled = false;
        }
        
        // Setup remove file button
        const removeFileBtn = document.getElementById('removeFile');
        if (removeFileBtn) {
            removeFileBtn.addEventListener('click', () => {
                this.removeCurrentFile();
            });
        }
    }
    
    removeCurrentFile() {
        this.currentFile = null;
        const fileInfo = document.getElementById('fileInfo');
        const convertBtn = document.getElementById('convertBtn');
        
        if (fileInfo) {
            anime({
                targets: fileInfo,
                opacity: [1, 0],
                translateY: [0, -20],
                duration: 300,
                easing: 'easeInQuart',
                complete: () => {
                    fileInfo.classList.add('hidden');
                }
            });
        }
        
        if (convertBtn) {
            convertBtn.disabled = true;
        }
        
        // Clear preview
        this.clearPreview();
    }
    
    detectFileFormat(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const formatMap = {
            'json': 'json',
            'xml': 'xml',
            'csv': 'csv',
            'txt': 'txt',
            'md': 'markdown',
            'html': 'html',
            'css': 'css',
            'js': 'javascript',
            'pdf': 'pdf',
            'jpg': 'jpg',
            'jpeg': 'jpg',
            'png': 'png',
            'gif': 'gif',
            'svg': 'svg',
            'mp3': 'mp3',
            'wav': 'wav',
            'mp4': 'mp4',
            'zip': 'zip',
            'tar': 'tar',
            'yaml': 'yaml',
            'yml': 'yaml',
            'toml': 'toml',
            'ini': 'ini'
        };
        
        return formatMap[extension] || 'unknown';
    }
    
    setupFormatSelection() {
        const formatGrid = document.getElementById('formatGrid');
        const formatSearch = document.getElementById('formatSearch');
        
        if (!formatGrid) return;
        
        this.renderFormatGrid();
        
        if (formatSearch) {
            formatSearch.addEventListener('input', (e) => {
                this.filterFormats(e.target.value);
            });
        }
    }
    
    renderFormatGrid() {
        const formatGrid = document.getElementById('formatGrid');
        if (!formatGrid) return;
        
        const formats = this.getSupportedFormats();
        
        formatGrid.innerHTML = formats.map(format => `
            <div class="format-card bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors" 
                 data-format="${format.id}">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 ${format.color} rounded-lg flex items-center justify-center">
                        ${format.icon}
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-900">${format.name}</h4>
                        <p class="text-xs text-gray-500">${format.description}</p>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        formatGrid.querySelectorAll('.format-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectFormat(card.dataset.format);
            });
        });
    }
    
    getSupportedFormats() {
        return [
            { id: 'json', name: 'JSON', description: 'JavaScript Object Notation', icon: '📄', color: 'bg-orange-100 text-orange-600' },
            { id: 'xml', name: 'XML', description: 'Extensible Markup Language', icon: '🏷️', color: 'bg-purple-100 text-purple-600' },
            { id: 'csv', name: 'CSV', description: 'Comma-Separated Values', icon: '📊', color: 'bg-green-100 text-green-600' },
            { id: 'txt', name: 'Text', description: 'Plain Text File', icon: '📝', color: 'bg-gray-100 text-gray-600' },
            { id: 'pdf', name: 'PDF', description: 'Portable Document Format', icon: '📑', color: 'bg-red-100 text-red-600' },
            { id: 'jpg', name: 'JPEG', description: 'Joint Photographic Experts Group', icon: '🖼️', color: 'bg-yellow-100 text-yellow-600' },
            { id: 'png', name: 'PNG', description: 'Portable Network Graphics', icon: '🎨', color: 'bg-blue-100 text-blue-600' },
            { id: 'html', name: 'HTML', description: 'HyperText Markup Language', icon: '🌐', color: 'bg-orange-100 text-orange-600' },
            { id: 'css', name: 'CSS', description: 'Cascading Style Sheets', icon: '🎨', color: 'bg-blue-100 text-blue-600' },
            { id: 'js', name: 'JavaScript', description: 'JavaScript Code', icon: '⚡', color: 'bg-yellow-100 text-yellow-600' },
            { id: 'md', name: 'Markdown', description: 'Markdown Document', icon: '📝', color: 'bg-gray-100 text-gray-600' },
            { id: 'zip', name: 'ZIP', description: 'ZIP Archive', icon: '📦', color: 'bg-purple-100 text-purple-600' }
        ];
    }
    
    selectFormat(formatId) {
        // Remove previous selection
        document.querySelectorAll('.format-card').forEach(card => {
            card.classList.remove('ring-2', 'ring-blue-500');
        });
        
        // Add selection to clicked format
        const selectedCard = document.querySelector(`[data-format="${formatId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('ring-2', 'ring-blue-500');
        }
        
        this.selectedFormat = formatId;
        
        // Update preview if file is selected
        if (this.currentFile) {
            this.updatePreview();
        }
    }
    
    setupConversionControls() {
        const convertBtn = document.getElementById('convertBtn');
        const resetBtn = document.getElementById('resetBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const copyBtn = document.getElementById('copyBtn');
        
        if (convertBtn) {
            convertBtn.addEventListener('click', () => this.convertFile());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetForm());
        }
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadResult());
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyToClipboard());
        }
    }
    
    async convertFile() {
        if (!this.currentFile || !this.selectedFormat) {
            this.showNotification('Please select a file and target format', 'error');
            return;
        }
        
        const convertBtn = document.getElementById('convertBtn');
        const progressContainer = document.getElementById('conversionProgress');
        const progressBar = document.getElementById('progressBar');
        const progressPercent = document.getElementById('progressPercent');
        
        // Show progress
        if (progressContainer) {
            progressContainer.classList.remove('hidden');
        }
        
        if (convertBtn) {
            convertBtn.disabled = true;
            convertBtn.textContent = 'Converting...';
        }
        
        // Simulate conversion progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressPercent) progressPercent.textContent = `${Math.round(progress)}%`;
        }, 200);
        
        try {
            // Simulate conversion delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Complete progress
            clearInterval(progressInterval);
            if (progressBar) progressBar.style.width = '100%';
            if (progressPercent) progressPercent.textContent = '100%';
            
            // Generate converted content
            const convertedContent = await this.simulateConversion(this.currentFile, this.selectedFormat);
            
            // Show download section
            this.showDownloadSection(convertedContent);
            
            // Add to history
            this.addToHistory({
                id: Date.now(),
                filename: this.currentFile.name,
                originalFormat: this.detectFileFormat(this.currentFile.name),
                targetFormat: this.selectedFormat,
                size: this.currentFile.size,
                timestamp: new Date(),
                status: 'success'
            });
            
            this.showNotification('File converted successfully!', 'success');
            
        } catch (error) {
            this.showNotification('Conversion failed: ' + error.message, 'error');
        } finally {
            // Reset UI
            if (convertBtn) {
                convertBtn.disabled = false;
                convertBtn.textContent = 'Convert File';
            }
            
            if (progressContainer) {
                setTimeout(() => {
                    progressContainer.classList.add('hidden');
                }, 1000);
            }
        }
    }
    
    async simulateConversion(file, targetFormat) {
        // Simulate reading file content
        const content = await this.readFileContent(file);
        
        // Simulate format conversion
        switch (targetFormat) {
            case 'json':
                return this.convertToJSON(content);
            case 'xml':
                return this.convertToXML(content);
            case 'csv':
                return this.convertToCSV(content);
            case 'txt':
                return content;
            default:
                return content;
        }
    }
    
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
    
    convertToJSON(content) {
        try {
            // Try to parse existing JSON or create structured data
            const data = JSON.parse(content) || { content: content };
            return JSON.stringify(data, null, 2);
        } catch {
            return JSON.stringify({ content: content }, null, 2);
        }
    }
    
    convertToXML(content) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<root>
    <content>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</content>
</root>`;
    }
    
    convertToCSV(content) {
        const lines = content.split('\n');
        return lines.map(line => `"${line.replace(/"/g, '""')}"`).join('\n');
    }
    
    showDownloadSection(content) {
        const downloadSection = document.getElementById('downloadSection');
        const outputFileName = document.getElementById('outputFileName');
        const outputFileSize = document.getElementById('outputFileSize');
        const conversionTime = document.getElementById('conversionTime');
        
        if (downloadSection) {
            downloadSection.classList.remove('hidden');
            
            // Update file info
            const originalName = this.currentFile.name;
            const newName = originalName.replace(/\.[^/.]+$/, '') + '.' + this.selectedFormat;
            
            if (outputFileName) outputFileName.textContent = newName;
            if (outputFileSize) outputFileSize.textContent = this.formatFileSize(new Blob([content]).size);
            if (conversionTime) conversionTime.textContent = 'Converted in 2.3s';
            
            // Store converted content for download
            this.convertedContent = content;
            this.convertedFilename = newName;
            
            // Animate appearance
            anime({
                targets: downloadSection,
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 500,
                easing: 'easeOutQuart'
            });
        }
    }
    
    downloadResult() {
        if (!this.convertedContent || !this.convertedFilename) return;
        
        const blob = new Blob([this.convertedContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.convertedFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('File downloaded successfully!', 'success');
    }
    
    async copyToClipboard() {
        if (!this.convertedContent) return;
        
        try {
            await navigator.clipboard.writeText(this.convertedContent);
            this.showNotification('Content copied to clipboard!', 'success');
        } catch (err) {
            this.showNotification('Failed to copy to clipboard', 'error');
        }
    }
    
    updatePreview() {
        const previewContainer = document.getElementById('previewContainer');
        if (!previewContainer || !this.currentFile) return;
        
        // Simulate preview generation
        previewContainer.innerHTML = `
            <div class="w-full">
                <div class="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 class="font-medium text-gray-900 mb-2">Preview (${this.selectedFormat.toUpperCase()})</h4>
                    <div class="text-sm text-gray-600 font-mono whitespace-pre-wrap">
                        ${this.selectedFormat === 'json' ? '{\n  "preview": "Sample converted content"\n}' : 
                          this.selectedFormat === 'xml' ? '<preview>Sample converted content</preview>' :
                          this.selectedFormat === 'csv' ? 'preview,content\nSample,converted' :
                          'Sample converted content'}
                    </div>
                </div>
                <p class="text-xs text-gray-500 text-center">Full preview available after conversion</p>
            </div>
        `;
    }
    
    clearPreview() {
        const previewContainer = document.getElementById('previewContainer');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div class="text-center text-gray-500">
                    <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 2H4z"/>
                    </svg>
                    <p>Preview will appear here</p>
                </div>
            `;
        }
    }
    
    resetForm() {
        this.removeCurrentFile();
        this.selectedFormat = null;
        
        // Clear format selection
        document.querySelectorAll('.format-card').forEach(card => {
            card.classList.remove('ring-2', 'ring-blue-500');
        });
        
        // Hide download section
        const downloadSection = document.getElementById('downloadSection');
        if (downloadSection) {
            downloadSection.classList.add('hidden');
        }
        
        // Reset file input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.value = '';
        }
        
        this.showNotification('Form reset successfully', 'info');
    }
    
    initializeChart() {
        const chartContainer = document.getElementById('formatChart');
        if (!chartContainer) return;
        
        const chart = echarts.init(chartContainer);
        
        const option = {
            title: {
                text: 'Popular Conversions',
                left: 'center',
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'normal'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['JSON', 'CSV', 'PDF', 'JPG', 'PNG', 'XML', 'TXT', 'MP3']
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: [2340, 1890, 1650, 1420, 1280, 1150, 980, 750],
                type: 'bar',
                itemStyle: {
                    color: '#007BFF'
                },
                animationDelay: function (idx) {
                    return idx * 100;
                }
            }]
        };
        
        chart.setOption(option);
        
        // Responsive chart
        window.addEventListener('resize', () => {
            chart.resize();
        });
    }
    
    loadRecentConversions() {
        const recentContainer = document.getElementById('recentConversions');
        if (!recentContainer) return;
        
        const recent = this.conversionHistory.slice(0, 5);
        
        if (recent.length === 0) {
            recentContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p>No recent conversions</p>
                    <p class="text-sm">Start converting files to see your history</p>
                </div>
            `;
            return;
        }
        
        recentContainer.innerHTML = recent.map(conversion => `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 2H4z"/>
                        </svg>
                    </div>
                    <div>
                        <p class="font-medium text-gray-900">${conversion.filename}</p>
                        <p class="text-sm text-gray-500">${conversion.originalFormat.toUpperCase()} → ${conversion.targetFormat.toUpperCase()}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-500">${this.formatRelativeTime(conversion.timestamp)}</p>
                    <button class="text-blue-600 hover:text-blue-700 text-sm font-medium">Convert Again</button>
                </div>
            </div>
        `).join('');
    }
    
    // ==================== BATCH CONVERTER FUNCTIONALITY ====================
    
    initBatchConverter() {
        this.setupBatchDragDrop();
        this.setupBatchControls();
        this.setupBatchSettings();
        this.initializeBatchCharts();
    }
    
    setupBatchDragDrop() {
        const batchDropZone = document.getElementById('batchDropZone');
        const batchFileInput = document.getElementById('batchFileInput');
        
        if (!batchDropZone || !batchFileInput) return;
        
        // Similar to main converter but for multiple files
        batchDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            batchDropZone.classList.add('dragover');
        });
        
        batchDropZone.addEventListener('dragleave', () => {
            batchDropZone.classList.remove('dragover');
        });
        
        batchDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            batchDropZone.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            this.addFilesToBatch(files);
        });
        
        batchDropZone.addEventListener('click', () => {
            batchFileInput.click();
        });
        
        batchFileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.addFilesToBatch(files);
        });
    }
    
    addFilesToBatch(files) {
        files.forEach(file => {
            const batchItem = {
                id: Date.now() + Math.random(),
                file: file,
                format: this.detectFileFormat(file.name),
                targetFormat: '',
                status: 'pending',
                progress: 0,
                result: null
            };
            
            this.batchQueue.push(batchItem);
        });
        
        this.updateBatchUI();
        this.updateBatchStats();
    }
    
    updateBatchUI() {
        const fileQueue = document.getElementById('fileQueue');
        if (!fileQueue) return;
        
        if (this.batchQueue.length === 0) {
            fileQueue.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 2H4z"/>
                    </svg>
                    <p>No files in queue</p>
                    <p class="text-sm">Add files to start batch conversion</p>
                </div>
            `;
            return;
        }
        
        fileQueue.innerHTML = this.batchQueue.map(item => `
            <div class="file-item bg-white rounded-lg p-4 border ${this.getStatusBorderClass(item.status)}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 2H4z"/>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <p class="font-medium text-gray-900">${item.file.name}</p>
                            <p class="text-sm text-gray-500">${this.formatFileSize(item.file.size)} • ${item.format.toUpperCase()}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3">
                        <select class="px-2 py-1 border border-gray-300 rounded text-sm" data-file-id="${item.id}">
                            <option value="">Select format</option>
                            <option value="json">JSON</option>
                            <option value="xml">XML</option>
                            <option value="csv">CSV</option>
                            <option value="txt">Text</option>
                        </select>
                        <div class="flex items-center space-x-2">
                            <span class="status-indicator status-${item.status}"></span>
                            <span class="text-sm text-gray-600">${this.getStatusText(item.status)}</span>
                        </div>
                        <button class="text-red-500 hover:text-red-700" onclick="fileConverter.removeBatchItem('${item.id}')">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                            </svg>
                        </button>
                    </div>
                    ${item.status === 'processing' ? `
                        <div class="mt-3">
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: ${item.progress}%"></div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        // Add change handlers for format selection
        fileQueue.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', (e) => {
                const fileId = e.target.dataset.fileId;
                const item = this.batchQueue.find(item => item.id == fileId);
                if (item) {
                    item.targetFormat = e.target.value;
                }
            });
        });
    }
    
    getStatusBorderClass(status) {
        switch (status) {
            case 'processing': return 'border-yellow-300';
            case 'completed': return 'border-green-300';
            case 'error': return 'border-red-300';
            default: return 'border-gray-200';
        }
    }
    
    getStatusText(status) {
        switch (status) {
            case 'pending': return 'Pending';
            case 'processing': return 'Processing';
            case 'completed': return 'Completed';
            case 'error': return 'Error';
            default: return 'Unknown';
        }
    }
    
    updateBatchStats() {
        const totalFiles = document.getElementById('totalFiles');
        const processingFiles = document.getElementById('processingFiles');
        const completedFiles = document.getElementById('completedFiles');
        const failedFiles = document.getElementById('failedFiles');
        
        const stats = this.batchQueue.reduce((acc, item) => {
            acc.total++;
            if (item.status === 'processing') acc.processing++;
            if (item.status === 'completed') acc.completed++;
            if (item.status === 'error') acc.failed++;
            return acc;
        }, { total: 0, processing: 0, completed: 0, failed: 0 });
        
        if (totalFiles) totalFiles.textContent = `${stats.total} files`;
        if (processingFiles) processingFiles.textContent = `${stats.processing} processing`;
        if (completedFiles) completedFiles.textContent = `${stats.completed} completed`;
        if (failedFiles) failedFiles.textContent = `${stats.failed} failed`;
    }
    
    setupBatchControls() {
        const startBatchBtn = document.getElementById('startBatchBtn');
        const pauseBatchBtn = document.getElementById('pauseBatchBtn');
        const resumeBatchBtn = document.getElementById('resumeBatchBtn');
        const cancelBatchBtn = document.getElementById('cancelBatchBtn');
        const clearQueueBtn = document.getElementById('clearQueueBtn');
        const removeCompletedBtn = document.getElementById('removeCompletedBtn');
        const downloadAllBtn = document.getElementById('downloadAllBtn');
        
        if (startBatchBtn) {
            startBatchBtn.addEventListener('click', () => this.startBatchConversion());
        }
        
        if (pauseBatchBtn) {
            pauseBatchBtn.addEventListener('click', () => this.pauseBatchConversion());
        }
        
        if (resumeBatchBtn) {
            resumeBatchBtn.addEventListener('click', () => this.resumeBatchConversion());
        }
        
        if (cancelBatchBtn) {
            cancelBatchBtn.addEventListener('click', () => this.cancelBatchConversion());
        }
        
        if (clearQueueBtn) {
            clearQueueBtn.addEventListener('click', () => this.clearBatchQueue());
        }
        
        if (removeCompletedBtn) {
            removeCompletedBtn.addEventListener('click', () => this.removeCompletedItems());
        }
        
        if (downloadAllBtn) {
            downloadAllBtn.addEventListener('click', () => this.downloadAllResults());
        }
    }
    
    async startBatchConversion() {
        if (this.batchQueue.length === 0) {
            this.showNotification('No files in queue', 'error');
            return;
        }
        
        const itemsWithoutFormat = this.batchQueue.filter(item => !item.targetFormat);
        if (itemsWithoutFormat.length > 0) {
            this.showNotification('Please select target formats for all files', 'error');
            return;
        }
        
        this.isProcessing = true;
        
        // Update UI
        const startBatchBtn = document.getElementById('startBatchBtn');
        const pauseBatchBtn = document.getElementById('pauseBatchBtn');
        const cancelBatchBtn = document.getElementById('cancelBatchBtn');
        
        if (startBatchBtn) startBatchBtn.disabled = true;
        if (pauseBatchBtn) pauseBatchBtn.disabled = false;
        if (cancelBatchBtn) cancelBatchBtn.disabled = false;
        
        // Process each file
        for (let i = 0; i < this.batchQueue.length; i++) {
            if (!this.isProcessing) break;
            
            const item = this.batchQueue[i];
            if (item.status === 'completed') continue;
            
            item.status = 'processing';
            this.updateBatchUI();
            
            try {
                // Simulate conversion with progress
                for (let progress = 0; progress <= 100; progress += 10) {
                    if (!this.isProcessing) break;
                    
                    item.progress = progress;
                    this.updateBatchUI();
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                
                if (this.isProcessing) {
                    item.status = 'completed';
                    item.result = `Converted ${item.file.name} to ${item.targetFormat}`;
                }
            } catch (error) {
                item.status = 'error';
                item.error = error.message;
            }
        }
        
        this.isProcessing = false;
        
        // Reset UI
        if (startBatchBtn) startBatchBtn.disabled = false;
        if (pauseBatchBtn) pauseBatchBtn.disabled = true;
        if (cancelBatchBtn) cancelBatchBtn.disabled = true;
        
        this.updateBatchUI();
        this.updateBatchStats();
        
        this.showNotification('Batch conversion completed!', 'success');
    }
    
    pauseBatchConversion() {
        this.isProcessing = false;
        this.showNotification('Batch conversion paused', 'info');
    }
    
    resumeBatchConversion() {
        this.startBatchConversion();
    }
    
    cancelBatchConversion() {
        this.isProcessing = false;
        this.batchQueue.forEach(item => {
            if (item.status === 'processing') {
                item.status = 'pending';
                item.progress = 0;
            }
        });
        this.updateBatchUI();
        this.showNotification('Batch conversion cancelled', 'info');
    }
    
    clearBatchQueue() {
        this.batchQueue = [];
        this.updateBatchUI();
        this.updateBatchStats();
        this.showNotification('Batch queue cleared', 'info');
    }
    
    removeCompletedItems() {
        this.batchQueue = this.batchQueue.filter(item => item.status !== 'completed');
        this.updateBatchUI();
        this.updateBatchStats();
        this.showNotification('Completed items removed', 'info');
    }
    
    removeBatchItem(fileId) {
        this.batchQueue = this.batchQueue.filter(item => item.id != fileId);
        this.updateBatchUI();
        this.updateBatchStats();
    }
    
    downloadAllResults() {
        const completedItems = this.batchQueue.filter(item => item.status === 'completed');
        if (completedItems.length === 0) {
            this.showNotification('No completed conversions to download', 'error');
            return;
        }
        
        // Simulate ZIP download
        this.showNotification('Downloading all results as ZIP...', 'info');
        
        setTimeout(() => {
            this.showNotification('Download completed!', 'success');
        }, 2000);
    }
    
    setupBatchSettings() {
        const globalFormat = document.getElementById('globalFormat');
        if (globalFormat) {
            globalFormat.addEventListener('change', (e) => {
                const selectedFormat = e.target.value;
                if (selectedFormat) {
                    this.batchQueue.forEach(item => {
                        item.targetFormat = selectedFormat;
                    });
                    this.updateBatchUI();
                }
            });
        }
    }
    
    initializeBatchCharts() {
        // Initialize success rate chart
        const successRateChart = document.getElementById('successRateChart');
        if (successRateChart) {
            const chart = echarts.init(successRateChart);
            const option = {
                title: {
                    text: 'Success Rate by Format',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: { trigger: 'item' },
                series: [{
                    type: 'pie',
                    radius: '60%',
                    data: [
                        { value: 95, name: 'JSON' },
                        { value: 92, name: 'CSV' },
                        { value: 88, name: 'XML' },
                        { value: 85, name: 'TXT' }
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            };
            chart.setOption(option);
        }
        
        // Initialize processing time chart
        const processingTimeChart = document.getElementById('processingTimeChart');
        if (processingTimeChart) {
            const chart = echarts.init(processingTimeChart);
            const option = {
                title: {
                    text: 'Processing Time Distribution',
                    left: 'center',
                    textStyle: { fontSize: 14 }
                },
                tooltip: { trigger: 'axis' },
                xAxis: {
                    type: 'category',
                    data: ['0-1s', '1-2s', '2-3s', '3-4s', '4-5s', '5s+']
                },
                yAxis: { type: 'value' },
                series: [{
                    data: [45, 32, 18, 12, 8, 5],
                    type: 'bar',
                    itemStyle: { color: '#28A745' }
                }]
            };
            chart.setOption(option);
        }
    }
    
    // ==================== HISTORY VIEWER FUNCTIONALITY ====================
    
    initHistoryViewer() {
        this.setupHistorySearch();
        this.setupHistoryFilters();
        this.loadHistoryItems();
        this.setupHistoryExport();
    }
    
    setupHistorySearch() {
        const historySearch = document.getElementById('historySearch');
        if (historySearch) {
            historySearch.addEventListener('input', (e) => {
                this.filterHistory(e.target.value);
            });
        }
    }
    
    setupHistoryFilters() {
        const filters = ['dateFilter', 'formatFilter', 'statusFilter'];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => this.applyHistoryFilters());
            }
        });
        
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearHistoryFilters());
        }
    }
    
    loadHistoryItems() {
        const historyContainer = document.getElementById('historyContainer');
        if (!historyContainer) return;
        
        if (this.conversionHistory.length === 0) {
            // Keep the empty state as is
            return;
        }
        
        historyContainer.innerHTML = this.conversionHistory.map(conversion => `
            <div class="history-card ${conversion.status} p-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 2H4z"/>
                            </svg>
                        </div>
                        <div>
                            <h3 class="font-medium text-gray-900">${conversion.filename}</h3>
                            <div class="flex items-center space-x-2 mt-1">
                                <span class="format-badge format-${conversion.originalFormat}">${conversion.originalFormat.toUpperCase()}</span>
                                <span class="text-gray-400">→</span>
                                <span class="format-badge format-${conversion.targetFormat}">${conversion.targetFormat.toUpperCase()}</span>
                                <span class="text-sm text-gray-500">•</span>
                                <span class="text-sm text-gray-500">${this.formatFileSize(conversion.size)}</span>
                                <span class="text-sm text-gray-500">•</span>
                                <span class="text-sm text-gray-500">${this.formatRelativeTime(conversion.timestamp)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3">
                        <button class="favorite-btn ${conversion.favorite ? 'active' : ''}" onclick="fileConverter.toggleFavorite('${conversion.id}')">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                        </button>
                        <button class="btn-secondary px-3 py-1 rounded text-sm" onclick="fileConverter.repeatConversion('${conversion.id}')">
                            Repeat
                        </button>
                        <button class="btn-secondary px-3 py-1 rounded text-sm" onclick="fileConverter.viewDetails('${conversion.id}')">
                            Details
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    filterHistory(searchTerm) {
        // Implement search functionality
        this.applyHistoryFilters();
    }
    
    applyHistoryFilters() {
        // Implement filter functionality
        this.loadHistoryItems();
    }
    
    clearHistoryFilters() {
        const filters = ['dateFilter', 'formatFilter', 'statusFilter', 'historySearch'];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.value = filterId === 'historySearch' ? '' : 'all';
            }
        });
        this.loadHistoryItems();
    }
    
    setupHistoryExport() {
        const exportBtn = document.getElementById('exportBtn');
        const exportDropdown = document.getElementById('exportDropdown');
        
        if (exportBtn && exportDropdown) {
            exportBtn.addEventListener('click', () => {
                exportDropdown.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!exportBtn.contains(e.target) && !exportDropdown.contains(e.target)) {
                    exportDropdown.classList.remove('show');
                }
            });
            
            // Export format handlers
            exportDropdown.querySelectorAll('[data-format]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const format = btn.dataset.format;
                    this.exportHistory(format);
                    exportDropdown.classList.remove('show');
                });
            });
        }
        
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        }
    }
    
    exportHistory(format) {
        const data = this.conversionHistory.map(item => ({
            filename: item.filename,
            original_format: item.originalFormat,
            target_format: item.targetFormat,
            size: item.size,
            timestamp: item.timestamp.toISOString(),
            status: item.status
        }));
        
        let content, filename, mimeType;
        
        switch (format) {
            case 'csv':
                content = this.convertToCSV(JSON.stringify(data));
                filename = 'conversion_history.csv';
                mimeType = 'text/csv';
                break;
            case 'json':
                content = JSON.stringify(data, null, 2);
                filename = 'conversion_history.json';
                mimeType = 'application/json';
                break;
            case 'pdf':
                this.showNotification('PDF export coming soon!', 'info');
                return;
            case 'excel':
                this.showNotification('Excel export coming soon!', 'info');
                return;
            default:
                return;
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification(`History exported as ${format.toUpperCase()}`, 'success');
    }
    
    clearHistory() {
        if (confirm('Are you sure you want to clear all conversion history?')) {
            this.conversionHistory = [];
            this.saveHistory();
            this.loadHistoryItems();
            this.showNotification('History cleared successfully', 'info');
        }
    }
    
    toggleFavorite(conversionId) {
        const conversion = this.conversionHistory.find(c => c.id == conversionId);
        if (conversion) {
            conversion.favorite = !conversion.favorite;
            this.saveHistory();
            this.loadHistoryItems();
            this.showNotification(conversion.favorite ? 'Added to favorites' : 'Removed from favorites', 'success');
        }
    }
    
    repeatConversion(conversionId) {
        const conversion = this.conversionHistory.find(c => c.id == conversionId);
        if (conversion) {
            // Navigate to main converter and pre-fill the form
            localStorage.setItem('repeatConversion', JSON.stringify(conversion));
            window.location.href = 'index.html';
        }
    }
    
    viewDetails(conversionId) {
        const conversion = this.conversionHistory.find(c => c.id == conversionId);
        if (conversion) {
            // Show detail modal
            this.showDetailModal(conversion);
        }
    }
    
    showDetailModal(conversion) {
        const modal = document.getElementById('detailModal');
        const detailContent = document.getElementById('detailContent');
        
        if (modal && detailContent) {
            detailContent.innerHTML = `
                <div class="space-y-4">
                    <div>
                        <h4 class="font-medium text-gray-900">File Information</h4>
                        <div class="mt-2 space-y-1">
                            <p><span class="text-gray-600">Filename:</span> ${conversion.filename}</p>
                            <p><span class="text-gray-600">Size:</span> ${this.formatFileSize(conversion.size)}</p>
                            <p><span class="text-gray-600">Original Format:</span> ${conversion.originalFormat.toUpperCase()}</p>
                            <p><span class="text-gray-600">Target Format:</span> ${conversion.targetFormat.toUpperCase()}</p>
                            <p><span class="text-gray-600">Date:</span> ${conversion.timestamp.toLocaleString()}</p>
                            <p><span class="text-gray-600">Status:</span> ${conversion.status}</p>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="font-medium text-gray-900">Conversion Settings</h4>
                        <p class="text-sm text-gray-600 mt-1">Default settings applied</p>
                    </div>
                    
                    <div class="flex space-x-3 pt-4">
                        <button class="btn-primary px-4 py-2 rounded-lg font-medium" onclick="fileConverter.repeatConversion('${conversion.id}')">
                            Convert Again
                        </button>
                        <button class="btn-secondary px-4 py-2 rounded-lg font-medium" onclick="fileConverter.toggleFavorite('${conversion.id}')">
                            ${conversion.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>
                    </div>
                </div>
            `;
            
            modal.classList.remove('hidden');
            
            // Close modal handlers
            const closeBtn = document.getElementById('closeDetailModal');
            if (closeBtn) {
                closeBtn.onclick = () => modal.classList.add('hidden');
            }
            
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            };
        }
    }
    
    // ==================== HELP VIEWER FUNCTIONALITY ====================
    
    initHelpViewer() {
        this.setupHelpTabs();
        this.setupFAQAccordion();
        this.setupSettingsHandlers();
    }
    
    setupHelpTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Remove active class from all tabs and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                button.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });
    }
    
    setupFAQAccordion() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const icon = question.querySelector('svg');
                
                // Toggle answer visibility
                answer.classList.toggle('open');
                
                // Rotate icon
                if (answer.classList.contains('open')) {
                    icon.style.transform = 'rotate(180deg)';
                } else {
                    icon.style.transform = 'rotate(0deg)';
                }
            });
        });
    }
    
    setupSettingsHandlers() {
        // Settings form handlers
        const saveSettingsBtn = document.querySelector('.btn-primary');
        if (saveSettingsBtn && saveSettingsBtn.textContent.includes('Save Settings')) {
            saveSettingsBtn.addEventListener('click', () => this.saveUserSettings());
        }
        
        const resetSettingsBtn = document.querySelector('.btn-secondary');
        if (resetSettingsBtn && resetSettingsBtn.textContent.includes('Reset to Defaults')) {
            resetSettingsBtn.addEventListener('click', () => this.resetUserSettings());
        }
    }
    
    saveUserSettings() {
        const settings = {};
        
        // Collect all toggle settings
        const toggles = document.querySelectorAll('input[type="checkbox"]');
        toggles.forEach(toggle => {
            if (toggle.id) {
                settings[toggle.id] = toggle.checked;
            }
        });
        
        // Collect select settings
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            if (select.id) {
                settings[select.id] = select.value;
            }
        });
        
        this.userSettings = settings;
        localStorage.setItem('fileConverterSettings', JSON.stringify(settings));
        this.showNotification('Settings saved successfully!', 'success');
    }
    
    resetUserSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            localStorage.removeItem('fileConverterSettings');
            this.userSettings = {};
            this.loadUserPreferences();
            this.showNotification('Settings reset to defaults', 'info');
        }
    }
    
    // ==================== UTILITY FUNCTIONS ====================
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    formatRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }
    
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notificationMessage');
        const notificationIcon = document.getElementById('notificationIcon');
        
        if (!notification || !notificationMessage || !notificationIcon) return;
        
        // Set notification content and style
        notificationMessage.textContent = message;
        
        // Set icon and color based on type
        const styles = {
            success: { icon: '✓', bg: 'bg-green-100', text: 'text-green-600' },
            error: { icon: '✗', bg: 'bg-red-100', text: 'text-red-600' },
            warning: { icon: '⚠', bg: 'bg-yellow-100', text: 'text-yellow-600' },
            info: { icon: 'ℹ', bg: 'bg-blue-100', text: 'text-blue-600' }
        };
        
        const style = styles[type] || styles.info;
        notificationIcon.innerHTML = style.icon;
        notificationIcon.className = `w-8 h-8 rounded-full flex items-center justify-center ${style.bg} ${style.text}`;
        
        // Show notification
        notification.classList.add('show');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
        
        // Close button handler
        const closeBtn = document.getElementById('closeNotification');
        if (closeBtn) {
            closeBtn.onclick = () => {
                notification.classList.remove('show');
            };
        }
    }
    
    handleKeyboardShortcuts(e) {
        // Global keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'o':
                    e.preventDefault();
                    document.getElementById('fileInput')?.click();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.startBatchConversion();
                    } else {
                        this.convertFile();
                    }
                    break;
                case 'r':
                    e.preventDefault();
                    this.resetForm();
                    break;
                case 'd':
                    e.preventDefault();
                    this.toggleDarkMode();
                    break;
                case ',':
                    e.preventDefault();
                    window.location.href = 'help.html';
                    break;
            }
        }
        
        // Alt + number navigation
        if (e.altKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    window.location.href = 'index.html';
                    break;
                case '2':
                    e.preventDefault();
                    window.location.href = 'batch.html';
                    break;
                case '3':
                    e.preventDefault();
                    window.location.href = 'history.html';
                    break;
                case '4':
                    e.preventDefault();
                    window.location.href = 'help.html';
                    break;
            }
        }
    }
    
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        this.showNotification(isDark ? 'Dark mode enabled' : 'Light mode enabled', 'info');
    }
    
    loadUserPreferences() {
        // Load dark mode preference
        const darkMode = localStorage.getItem('darkMode');
        if (darkMode === 'true') {
            document.body.classList.add('dark-mode');
        }
        
        // Load user settings
        const settings = localStorage.getItem('fileConverterSettings');
        if (settings) {
            this.userSettings = JSON.parse(settings);
            
            // Apply settings to UI
            Object.keys(this.userSettings).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = this.userSettings[key];
                    } else {
                        element.value = this.userSettings[key];
                    }
                }
            });
        }
        
        // Load repeat conversion data
        const repeatData = localStorage.getItem('repeatConversion');
        if (repeatData && this.getCurrentPage() === 'index') {
            const conversion = JSON.parse(repeatData);
            // Pre-fill form with repeat data
            localStorage.removeItem('repeatConversion');
        }
    }
    
    addToHistory(conversion) {
        this.conversionHistory.unshift(conversion);
        
        // Keep only last 100 conversions
        if (this.conversionHistory.length > 100) {
            this.conversionHistory = this.conversionHistory.slice(0, 100);
        }
        
        this.saveHistory();
    }
    
    loadHistory() {
        const history = localStorage.getItem('conversionHistory');
        if (history) {
            return JSON.parse(history).map(item => ({
                ...item,
                timestamp: new Date(item.timestamp)
            }));
        }
        return [];
    }
    
    saveHistory() {
        localStorage.setItem('conversionHistory', JSON.stringify(this.conversionHistory));
    }
    
    loadSettings() {
        const settings = localStorage.getItem('fileConverterSettings');
        return settings ? JSON.parse(settings) : {};
    }
    
    initializeComponents() {
        // Initialize any additional components
        this.setupParticleEffects();
    }
    
    setupParticleEffects() {
        // Add particle effects to drag zones
        const particleContainers = document.querySelectorAll('.particle-container');
        particleContainers.forEach(container => {
            // Simple particle effect using CSS animations
            for (let i = 0; i < 5; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: rgba(0, 123, 255, 0.3);
                    border-radius: 50%;
                    animation: float ${2 + Math.random() * 2}s ease-in-out infinite;
                    animation-delay: ${Math.random() * 2}s;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                `;
                container.appendChild(particle);
            }
        });
        
        // Add CSS animation for particles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
                50% { transform: translateY(-10px) scale(1.2); opacity: 0.6; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fileConverter = new FileConverterPro();
});

// Export for global access
window.FileConverterPro = FileConverterPro;