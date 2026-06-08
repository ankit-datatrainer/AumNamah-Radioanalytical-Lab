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
                    id: 'the-importance-of-nabl-accreditation',
                    date: new Date().toISOString(),
                    featureImage: 'assets/images/about_us_lab.png',
                    title: 'The Importance of NABL Accreditation in Radioanalytical Testing',
                    excerpt: 'Discover why choosing an accredited laboratory guarantees clinical precision and reliability for your samples.',
                    content: '<h2>Why Accreditation Matters</h2><p>Accreditation by the National Accreditation Board for Testing and Calibration Laboratories (NABL) is a testament to a laboratory\'s technical competence and commitment to quality. When it comes to radioanalytical testing, precision is not just a preference; it is an absolute necessity.</p><p>By adhering to stringent NABL guidelines, we ensure that every test result is accurate, reliable, and legally valid. This provides our clients with the confidence they need to make critical decisions regarding food safety, environmental compliance, and industrial standards.</p><h3>The AumNamah Advantage</h3><p>At AumNamah Laboratory, our NABL accreditation reflects our state-of-the-art infrastructure, highly trained personnel, and rigorous quality control protocols.</p>',
                    status: 'published'
                },
                {
                    id: 'understanding-gamma-spectrometry',
                    date: new Date(Date.now() - 86400000 * 5).toISOString(),
                    featureImage: 'assets/images/radiation_detection_tech.png',
                    title: 'Understanding Gamma Spectrometry',
                    excerpt: 'A deep dive into how we measure radiation levels in water and food samples using state-of-the-art detectors.',
                    content: '<h2>What is Gamma Spectrometry?</h2><p>Gamma spectrometry is a powerful analytical technique used to identify and quantify gamma-emitting radionuclides in various samples. It relies on the detection of gamma rays, which are high-energy photons emitted during the radioactive decay of unstable atomic nuclei.</p><p>Our laboratory utilizes advanced High-Purity Germanium (HPGe) detectors, known for their exceptional energy resolution. This allows us to accurately identify complex mixtures of radionuclides, even at very low concentrations.</p><h3>Applications in Testing</h3><p>This technique is crucial for testing food, water, and environmental samples to ensure they meet safety regulations and are free from harmful radioactive contamination.</p>',
                    status: 'published'
                },
                {
                    id: 'new-guidelines-for-environmental-testing',
                    date: new Date(Date.now() - 86400000 * 12).toISOString(),
                    featureImage: 'assets/images/environmental_testing.png',
                    title: 'New Guidelines for Environmental Testing',
                    excerpt: 'Recent updates in environmental monitoring regulations and how AumNamah Laboratory helps you stay compliant.',
                    content: '<h2>Staying Ahead of Regulations</h2><p>Environmental regulations regarding Naturally Occurring Radioactive Material (NORM) and Technically Enhanced NORM (TENORM) are continuously evolving. Recent updates emphasize stricter limits and more comprehensive monitoring requirements for industries dealing with minerals, oil and gas, and water treatment.</p><p>AumNamah Laboratory stays at the forefront of these regulatory changes. Our comprehensive environmental testing services are designed to help industries navigate these complex guidelines, ensuring compliance and protecting public health and the environment.</p>',
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
            throw new Error("Backend not available");
        } catch (e) {
            console.error('Error fetching blog, checking fallback:', e);
            const fallbackBlogs = await this.getAllBlogs(true);
            return fallbackBlogs.find(b => b.id === id) || null;
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
