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
            console.error('Error fetching blogs:', e);
            return [];
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
