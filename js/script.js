/**
 * 图片压缩工具 - JavaScript 功能脚本
 * 实现图片上传、压缩、预览和下载功能
 */

class ImageCompressor {
    constructor() {
        this.originalFile = null;
        this.compressedBlob = null;
        this.originalImage = null;
        this.compressedImage = null;
        
        this.initializeElements();
        this.bindEvents();
    }

    // 初始化DOM元素
    initializeElements() {
        // 上传相关
        this.uploadArea = document.getElementById('uploadArea');
        this.uploadButton = document.getElementById('uploadButton');
        this.fileInput = document.getElementById('fileInput');
        
        // 压缩控制
        this.compressionSection = document.getElementById('compressionSection');
        this.qualitySlider = document.getElementById('qualitySlider');
        this.qualityValue = document.getElementById('qualityValue');
        this.formatOptions = document.querySelectorAll('.format-option');
        this.compressButton = document.getElementById('compressButton');
        
        // 预览相关
        this.previewSection = document.getElementById('previewSection');
        this.originalImage = document.getElementById('originalImage');
        this.compressedImage = document.getElementById('compressedImage');
        this.originalSize = document.getElementById('originalSize');
        this.compressedSize = document.getElementById('compressedSize');
        this.originalDimensions = document.getElementById('originalDimensions');
        this.compressedDimensions = document.getElementById('compressedDimensions');
        
        // 统计信息
        this.compressionStats = document.getElementById('compressionStats');
        this.compressionRatio = document.getElementById('compressionRatio');
        this.savedSpace = document.getElementById('savedSpace');
        
        // 下载
        this.downloadSection = document.getElementById('downloadSection');
        this.downloadButton = document.getElementById('downloadButton');
        
        // 加载和错误提示
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorToast = document.getElementById('errorToast');
        this.errorMessage = document.getElementById('errorMessage');
    }

    // 绑定事件监听器
    bindEvents() {
        // 文件上传事件
        this.uploadButton.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // 拖拽上传
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // 质量控制
        this.qualitySlider.addEventListener('input', (e) => this.updateQualityValue(e));
        
        // 格式选择
        this.formatOptions.forEach(option => {
            option.addEventListener('click', (e) => this.selectFormat(e));
        });
        
        // 压缩按钮
        this.compressButton.addEventListener('click', () => this.compressImage());
        
        // 下载按钮
        this.downloadButton.addEventListener('click', () => this.downloadImage());
    }

    // 处理文件选择
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    // 处理拖拽悬停
    handleDragOver(event) {
        event.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    // 处理拖拽离开
    handleDragLeave(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    // 处理文件拖拽
    handleDrop(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                this.processFile(file);
            } else {
                this.showError('请选择有效的图片文件');
            }
        }
    }

    // 处理文件
    processFile(file) {
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            this.showError('请选择有效的图片文件');
            return;
        }

        // 验证文件大小（最大50MB）
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            this.showError('文件大小不能超过50MB');
            return;
        }

        this.originalFile = file;
        
        // 显示原图预览
        this.displayOriginalImage(file);
        
        // 显示压缩控制区域
        this.compressionSection.style.display = 'flex';
        
        // 滚动到压缩区域
        this.compressionSection.scrollIntoView({ behavior: 'smooth' });
    }

    // 显示原图预览
    displayOriginalImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.originalImage.src = e.target.result;
            this.originalImage.onload = () => {
                // 更新文件信息
                this.originalSize.textContent = this.formatFileSize(file.size);
                this.originalDimensions.textContent = `${this.originalImage.naturalWidth} x ${this.originalImage.naturalHeight}`;
                
                // 显示预览区域
                this.previewSection.style.display = 'flex';
            };
        };
        reader.readAsDataURL(file);
    }

    // 更新质量值显示
    updateQualityValue(event) {
        const quality = event.target.value;
        this.qualityValue.textContent = `${quality}%`;
    }

    // 选择输出格式
    selectFormat(event) {
        // 移除所有active类
        this.formatOptions.forEach(option => option.classList.remove('active'));
        
        // 添加active类到选中的选项
        event.target.classList.add('active');
    }

    // 获取选中的格式
    getSelectedFormat() {
        const activeOption = document.querySelector('.format-option.active');
        return activeOption ? activeOption.dataset.format : 'jpeg';
    }

    // 压缩图片
    async compressImage() {
        if (!this.originalFile) {
            this.showError('请先选择图片文件');
            return;
        }

        this.showLoading(true);
        this.compressButton.disabled = true;

        try {
            const quality = parseInt(this.qualitySlider.value) / 100;
            const format = this.getSelectedFormat();
            
            // 创建Canvas进行压缩
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 创建图片对象
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                // 设置Canvas尺寸
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                
                // 绘制图片到Canvas
                ctx.drawImage(img, 0, 0);
                
                // 压缩图片
                canvas.toBlob((blob) => {
                    this.compressedBlob = blob;
                    this.displayCompressedImage(blob);
                    this.calculateCompressionStats();
                    this.showLoading(false);
                    this.compressButton.disabled = false;
                }, `image/${format}`, quality);
            };
            
            img.onerror = () => {
                this.showError('图片加载失败');
                this.showLoading(false);
                this.compressButton.disabled = false;
            };
            
            // 加载图片
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(this.originalFile);
            
        } catch (error) {
            console.error('压缩失败:', error);
            this.showError('图片压缩失败，请重试');
            this.showLoading(false);
            this.compressButton.disabled = false;
        }
    }

    // 显示压缩后的图片
    displayCompressedImage(blob) {
        const url = URL.createObjectURL(blob);
        this.compressedImage.src = url;
        
        this.compressedImage.onload = () => {
            // 更新压缩后图片信息
            this.compressedSize.textContent = this.formatFileSize(blob.size);
            this.compressedDimensions.textContent = `${this.compressedImage.naturalWidth} x ${this.compressedImage.naturalHeight}`;
            
            // 显示统计信息和下载按钮
            this.compressionStats.style.display = 'flex';
            this.downloadSection.style.display = 'flex';
            
            // 滚动到预览区域
            this.previewSection.scrollIntoView({ behavior: 'smooth' });
        };
    }

    // 计算压缩统计信息
    calculateCompressionStats() {
        const originalSize = this.originalFile.size;
        const compressedSize = this.compressedBlob.size;
        
        // 计算压缩率
        const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        this.compressionRatio.textContent = `${compressionRatio}%`;
        
        // 计算节省空间
        const savedSpace = originalSize - compressedSize;
        this.savedSpace.textContent = this.formatFileSize(savedSpace);
    }

    // 下载压缩后的图片
    downloadImage() {
        if (!this.compressedBlob) {
            this.showError('没有可下载的压缩图片');
            return;
        }

        // 创建下载链接
        const url = URL.createObjectURL(this.compressedBlob);
        const link = document.createElement('a');
        link.href = url;
        
        // 生成文件名
        const originalName = this.originalFile.name;
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        const format = this.getSelectedFormat();
        const quality = this.qualitySlider.value;
        link.download = `${nameWithoutExt}_compressed_${quality}%.${format}`;
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL对象
        URL.revokeObjectURL(url);
    }

    // 显示加载动画
    showLoading(show) {
        this.loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    // 显示错误提示
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorToast.style.display = 'block';
        
        // 3秒后自动隐藏
        setTimeout(() => {
            this.errorToast.style.display = 'none';
        }, 3000);
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 工具函数：防抖
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 工具函数：节流
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化图片压缩工具
    const imageCompressor = new ImageCompressor();
    
    // 添加页面滚动效果
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // 观察所有卡片元素
    document.querySelectorAll('.upload-area, .compression-card, .preview-card, .stat-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // 添加键盘快捷键支持
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + O 打开文件选择
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
            e.preventDefault();
            imageCompressor.fileInput.click();
        }
        
        // Ctrl/Cmd + S 下载压缩后的图片
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (imageCompressor.compressedBlob) {
                imageCompressor.downloadImage();
            }
        }
    });
    
    // 添加触摸设备支持
    if ('ontouchstart' in window) {
        // 为触摸设备优化交互
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            button.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
    
    // 性能优化：使用防抖处理滑块事件
    const debouncedQualityUpdate = debounce((e) => {
        imageCompressor.updateQualityValue(e);
    }, 100);
    
    imageCompressor.qualitySlider.addEventListener('input', debouncedQualityUpdate);
    
    console.log('图片压缩工具已初始化完成！');
    console.log('快捷键：Ctrl/Cmd + O 选择文件，Ctrl/Cmd + S 下载图片');
});

// 导出类供外部使用（如果需要）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageCompressor;
} 