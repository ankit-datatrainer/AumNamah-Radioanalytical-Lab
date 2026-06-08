window.blogStore = {
    async getAllBlogs(includeDrafts = false) {
        try {
            const response = await fetch('api/blogs.php');
            let blogs = await response.json();
            if (!includeDrafts) {
                blogs = blogs.filter(b => b.status === 'published');
            }
            return blogs;
        } catch (e) {
            console.error('Error fetching blogs, using fallback data:', e);
            // Fallback data when PHP/MySQL backend is unavailable
            return [
                {
                    id: 'post_1',
                    date: new Date().toISOString(),
                    featureImage: 'assets/images/about_us_lab.png',
                    title: 'The Importance of NABL Accreditation in Radioanalytical Testing',
                    excerpt: 'Discover why choosing an accredited laboratory guarantees clinical precision and reliability for your samples.',
                    status: 'published'
                },
                {
                    id: 'post_2',
                    date: new Date(Date.now() - 86400000 * 5).toISOString(),
                    featureImage: 'assets/images/radiation_detection_tech.png',
                    title: 'Understanding Gamma Spectrometry',
                    excerpt: 'A deep dive into how we measure radiation levels in water and food samples using state-of-the-art detectors.',
                    status: 'published'
                },
                {
                    id: 'post_3',
                    date: new Date(Date.now() - 86400000 * 12).toISOString(),
                    featureImage: 'assets/images/environmental_testing.png',
                    title: 'New Guidelines for Environmental Testing',
                    excerpt: 'Recent updates in environmental monitoring regulations and how AumNamah Laboratory helps you stay compliant.',
                    status: 'published'
                }
            ];
        }
    },

    async getBlogById(id) {
        try {
            const response = await fetch(`api/blogs.php?id=${id}`);
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (e) {
            console.error('Error fetching blog:', e);
            return null;
        }
    },

    async saveBlog(blogData) {
        try {
            const method = blogData.id ? 'PUT' : 'POST';
            const response = await fetch('api/blogs.php', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(blogData)
            });
            return await response.json();
        } catch (e) {
            console.error('Error saving blog:', e);
            return null;
        }
    },

    async deleteBlog(id) {
        try {
            const response = await fetch('api/blogs.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            return await response.json();
        } catch (e) {
            console.error('Error deleting blog:', e);
            return null;
        }
    },

    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await fetch('api/upload.php', {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (e) {
            console.error('Error uploading image:', e);
            return { error: 'Network error during upload' };
        }
    }
};
