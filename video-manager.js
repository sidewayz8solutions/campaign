// Video Manager for Frank Scurlock Campaign
class VideoManager {
    constructor() {
        this.storageKey = 'campaignVideos';
        this.init();
    }

    init() {
        // Initialize with some sample data if no videos exist
        if (!localStorage.getItem(this.storageKey)) {
            this.initializeSampleData();
        }
    }

    initializeSampleData() {
        const sampleVideos = [
            {
                id: 1,
                title: "Frank's Vision for New Orleans",
                description: "Learn about Frank Scurlock's comprehensive plan to revitalize our city and bring real change to New Orleans.",
                category: "featured",
                type: "youtube",
                youtubeId: "dQw4w9WgXcQ", // Replace with actual video ID
                dateAdded: new Date().toISOString()
            },
            {
                id: 2,
                title: "Economic Development Plan",
                description: "Discover how Frank's business experience will create jobs and opportunities for all New Orleanians.",
                category: "featured",
                type: "vimeo",
                vimeoId: "123456789", // Replace with actual video ID
                dateAdded: new Date().toISOString()
            },
            {
                id: 3,
                title: "Meet Frank - 60 Second Introduction",
                description: "A quick introduction to Frank Scurlock and his campaign for mayor.",
                category: "shorts",
                type: "youtube",
                youtubeId: "dQw4w9WgXcQ", // Replace with actual video ID
                dateAdded: new Date().toISOString()
            }
        ];
        
        localStorage.setItem(this.storageKey, JSON.stringify(sampleVideos));
    }

    getAllVideos() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    }

    getVideosByCategory(category) {
        return this.getAllVideos().filter(video => video.category === category);
    }

    addVideo(videoData) {
        const videos = this.getAllVideos();
        const newVideo = {
            id: Date.now(),
            ...videoData,
            dateAdded: new Date().toISOString()
        };
        videos.push(newVideo);
        localStorage.setItem(this.storageKey, JSON.stringify(videos));
        return newVideo;
    }

    updateVideo(id, videoData) {
        const videos = this.getAllVideos();
        const index = videos.findIndex(video => video.id === id);
        if (index !== -1) {
            videos[index] = { ...videos[index], ...videoData };
            localStorage.setItem(this.storageKey, JSON.stringify(videos));
            return videos[index];
        }
        return null;
    }

    deleteVideo(id) {
        const videos = this.getAllVideos();
        const filteredVideos = videos.filter(video => video.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(filteredVideos));
        return true;
    }

    generateVideoHTML(video) {
        const platformIcon = {
            youtube: '📺',
            vimeo: '🎬',
            local: '💾'
        };

        const platformName = {
            youtube: 'YouTube',
            vimeo: 'Vimeo',
            local: 'Local Video'
        };

        let videoEmbed = '';
        
        switch (video.type) {
            case 'youtube':
                videoEmbed = `<iframe src="https://www.youtube.com/embed/${video.youtubeId}" title="${video.title}" allowfullscreen></iframe>`;
                break;
            case 'vimeo':
                videoEmbed = `<iframe src="https://player.vimeo.com/video/${video.vimeoId}" title="${video.title}" allowfullscreen></iframe>`;
                break;
            case 'local':
                const posterAttr = video.thumbnailName ? `poster="uploads/${video.thumbnailName}"` : '';
                videoEmbed = `
                    <video controls ${posterAttr}>
                        <source src="uploads/${video.fileName}" type="video/mp4">
                        <source src="uploads/${video.fileName.replace('.mp4', '.webm')}" type="video/webm">
                        Your browser does not support the video tag.
                    </video>
                `;
                break;
        }

        return `
            <div class="video-card" data-video-id="${video.id}">
                <div class="video-wrapper">
                    ${videoEmbed}
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <p class="video-description">${video.description}</p>
                    <span class="video-platform">${platformIcon[video.type]} ${platformName[video.type]}</span>
                </div>
            </div>
        `;
    }

    renderVideosToContainer(containerId, category = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const videos = category ? this.getVideosByCategory(category) : this.getAllVideos();
        
        if (videos.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No videos available in this category.</p>';
            return;
        }

        container.innerHTML = videos.map(video => this.generateVideoHTML(video)).join('');
    }

    // Method to handle file uploads (would need server-side implementation)
    async uploadFile(file, type = 'video') {
        // In a real implementation, this would upload to your server
        // For now, we'll simulate the upload
        return new Promise((resolve) => {
            setTimeout(() => {
                const fileName = `${Date.now()}_${file.name}`;
                resolve(fileName);
            }, 1000);
        });
    }

    // Export videos data (for backup or migration)
    exportVideos() {
        const videos = this.getAllVideos();
        const dataStr = JSON.stringify(videos, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'campaign-videos-backup.json';
        link.click();
    }

    // Import videos data
    importVideos(jsonData) {
        try {
            const videos = JSON.parse(jsonData);
            localStorage.setItem(this.storageKey, JSON.stringify(videos));
            return true;
        } catch (error) {
            console.error('Error importing videos:', error);
            return false;
        }
    }

    // Get video statistics
    getStats() {
        const videos = this.getAllVideos();
        const stats = {
            total: videos.length,
            byType: {},
            byCategory: {}
        };

        videos.forEach(video => {
            // Count by type
            stats.byType[video.type] = (stats.byType[video.type] || 0) + 1;
            
            // Count by category
            stats.byCategory[video.category] = (stats.byCategory[video.category] || 0) + 1;
        });

        return stats;
    }
}

// Initialize video manager
const videoManager = new VideoManager();

// Make it globally available
window.videoManager = videoManager;

// Auto-load videos when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load featured videos
    if (document.getElementById('featuredVideos')) {
        videoManager.renderVideosToContainer('featuredVideos', 'featured');
    }
    
    // Load short videos
    if (document.getElementById('shortVideos')) {
        videoManager.renderVideosToContainer('shortVideos', 'shorts');
    }
    
    // Load all videos if on admin page
    if (document.getElementById('videoListContainer')) {
        loadVideosForAdmin();
    }
});

// Admin-specific functions
function loadVideosForAdmin() {
    const videos = videoManager.getAllVideos();
    const container = document.getElementById('videoListContainer');
    
    if (videos.length === 0) {
        container.innerHTML = '<div style="padding: 2rem; text-align: center; color: #666;">No videos added yet</div>';
        return;
    }
    
    container.innerHTML = videos.map(video => `
        <div class="video-item">
            <div class="video-thumbnail">
                ${video.type === 'youtube' ? '📺' : video.type === 'vimeo' ? '🎬' : '💾'}
            </div>
            <div class="video-info">
                <h3>${video.title}</h3>
                <p>${video.description}</p>
                <span class="video-platform">${video.type.toUpperCase()} • ${video.category.toUpperCase()}</span>
            </div>
            <div class="video-actions">
                <button class="btn btn-small btn-edit" onclick="editVideo(${video.id})">Edit</button>
                <button class="btn btn-small btn-delete" onclick="deleteVideo(${video.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function deleteVideo(id) {
    if (confirm('Are you sure you want to delete this video?')) {
        videoManager.deleteVideo(id);
        loadVideosForAdmin();
    }
}

function editVideo(id) {
    // This would open an edit form in a real implementation
    alert('Edit functionality would be implemented here');
}

// Form handling for admin page
function handleVideoForm(formData) {
    const videoType = document.querySelector('.video-type-option.active').dataset.type;
    
    const videoData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        type: videoType
    };

    // Add type-specific data
    switch (videoType) {
        case 'youtube':
            videoData.youtubeId = formData.get('youtubeId');
            break;
        case 'vimeo':
            videoData.vimeoId = formData.get('vimeoId');
            break;
        case 'local':
            videoData.fileName = formData.get('videoFile')?.name || null;
            videoData.thumbnailName = formData.get('thumbnailFile')?.name || null;
            break;
    }

    videoManager.addVideo(videoData);
    return true;
}
