// static/js/main.js

// Elements
const dogInput = document.getElementById('dog_image');
const preview = document.getElementById('preview');
const previewBox = document.getElementById('previewBox');
const uploadBox = document.getElementById('uploadBox');
const resetBtn = document.getElementById('resetBtn');
const resultCenter = document.getElementById('resultCenter');
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
const predictBtn = document.getElementById('predictBtn');
const descSection = document.getElementById('breedDescription');
const descText = document.getElementById('breedDescText');
const wikiLink = document.getElementById('breedWikiLink');
const breedEl = document.getElementById('breedName');
const confEl = document.getElementById('confidence');
const note = document.getElementById("lowConfidenceNote");
const breedLoader = document.getElementById('breedLoader');
const predictLoader = document.getElementById('predictLoader');

// SHOW PREVIEW + SHIFT UPLOAD BOX
if (dogInput && preview && previewBox && uploadBox) {
    dogInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // preview image
        preview.src = URL.createObjectURL(file);

        // show preview box always
        previewBox.classList.remove("hidden");
        previewBox.style.pointerEvents = "auto";
        previewBox.style.transform = "translateY(0)";
        previewBox.classList.remove('translate-y-4');

        // show reset button
        resetBtn.classList.remove("hidden");

        // move upload box left
        uploadBox.style.transform = "translateX(-10px)";

        // hide result until backend returns (does NOT hide preview)
        if (resultCenter) {
            resultCenter.classList.add("hidden");
            resultCenter.style.pointerEvents = "none";
            resultCenter.style.transform = "translateY(12px)";
        }
    });
}

// RESET BUTTON 
if (resetBtn) {
    resetBtn.addEventListener('click', () => {

        // clear file input
        if (dogInput) dogInput.value = "";

        // reset preview to placeholder but KEEP preview visible
        if (preview) {
            preview.src = preview.dataset.placeholder || preview.src;
        }

        previewBox.classList.add("hidden");
        resetBtn.classList.add("hidden");
        previewBox.style.pointerEvents = "auto";
        previewBox.style.transform = "translateY(0)";
        descSection.classList.add('hidden');

        // re-center upload box
        uploadBox.style.transform = "translateX(0)";

        // hide result
        if (resultCenter) {
            resultCenter.classList.add("hidden");
            resultCenter.style.pointerEvents = "none";
            resultCenter.style.transform = "translateY(12px)";
        }
    });
}


if (predictBtn && dogInput) {
    predictBtn.addEventListener('click', async (e) => {
        e.preventDefault(); // prevent page reload

        const file = dogInput.files[0];
        if (!file) return alert('Please select an image before predicting!');

        predictBtn.classList.add('hidden');
        predictLoader.classList.remove('hidden');
        predictLoader.classList.add('show');

        const formData = new FormData();
        formData.append('dog_image', file);

        try {
            const res = await fetch('/', {  // replace '/' with your prediction endpoint
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest', // optional, for Django AJAX detection
                    'X-CSRFToken': csrftoken
                }
            });

            if (!res.ok) throw new Error('Prediction failed');

            const data = await res.json(); // backend returns JSON {breed, confidence}

            // Update resultCenter dynamically
            breedEl.textContent = data.breed;

            let confidencePercentage = data.confidence * 100;
            confidencePercentage = confidencePercentage.toFixed(2);
            confEl.textContent = `Confidence: ${confidencePercentage}%`;

            if (confidencePercentage < 70) {   // threshold: choose 50–70
                note.innerText =
                    "Note: The confidence score is low. The predicted breed may be inaccurate because the model currently supports only three dog types.";
                note.classList.remove("hidden");
            } else {
                note.classList.add("hidden");
            }

            resultCenter.classList.remove('hidden');
            resultCenter.style.pointerEvents = 'auto';
            resultCenter.style.transform = 'translateY(0)';

            // Show preview if not already
            previewBox.classList.remove('hidden');
            resetBtn.classList.remove('hidden');
            previewBox.style.pointerEvents = "auto";
            previewBox.style.transform = "translateY(0)";
            uploadBox.style.transform = "translateX(-10px)";

        } catch (err) {
            console.error(err);
            alert('Prediction failed.');
        }
        finally {
            predictLoader.classList.add('hidden');
            predictLoader.classList.remove('show');
            predictBtn.classList.remove('hidden');
        }
    });
}


// HERO SLIDESHOW
document.addEventListener("DOMContentLoaded", () => {
    const images = [
        '/static/images/dog1.jpg?v=1',
        '/static/images/dog2.jpg?v=1',
        '/static/images/dog3.jpg?v=1',
        '/static/images/dog4.jpg?v=1',
        '/static/images/dog5.jpg?v=1',
        '/static/images/dog6.jpg?v=1',
        '/static/images/dog7.jpg?v=1',
        '/static/images/dog8.jpg?v=1',
        '/static/images/dog9.jpg?v=1'
    ];

    let current = 0;

    const bg1 = document.getElementById("hero-bg1");
    const bg2 = document.getElementById("hero-bg2");

    bg1.style.backgroundImage = `url('${images[0]}')`;

    setInterval(() => {
        const next = (current + 1) % images.length;
        const img = new Image();
        img.src = images[next];

        img.onload = () => {
            bg2.style.backgroundImage = `url('${images[next]}')`;
            bg2.style.opacity = 1;
            bg1.style.opacity = 0;

            setTimeout(() => {
                bg1.style.backgroundImage = bg2.style.backgroundImage;
                bg1.style.opacity = 1;
                bg2.style.opacity = 0;
            }, 1000);

            current = next;
        };

    }, 6000);
});

// KNOW MORE BUTTON
document.addEventListener('click', async (e) => {
    if (!e.target) return;

    if (e.target.id === 'knowMore' || e.target.id === 'knowMore2') {

        const knowMoreBtn = e.target;
        const breedEl = document.getElementById('breedName');

        if (!breedEl) return alert('Breed not available');

        const breed = breedEl.innerText.trim();
        if (!breed) return alert('Breed not available');

        knowMoreBtn.classList.add('hidden');
        breedLoader.classList.remove('hidden');
        breedLoader.classList.add('show');

        try {
            const res = await fetch(`/api/know_more/${encodeURIComponent(breed)}/`);
            if (!res.ok) throw new Error('Failed to fetch breed info');

            const data = await res.json();

            breedLoader.classList.add('hidden');
            breedLoader.classList.remove('show');
            knowMoreBtn.classList.remove('hidden');

            // Fill the hidden description section
            if (descSection && descText) {
                descText.textContent = data.description || "No description available.";

                const wikiUrl = `https://en.wikipedia.org/wiki/${breed.replace(/\s+/g, '_')}`;
                wikiLink.href = wikiUrl;

                descSection.classList.remove('hidden');
                descSection.classList.add('opacity-100', 'translate-y-0');
            }

        } catch (err) {
            console.error(err);
            breedLoader.classList.add('hidden');
            breedLoader.classList.remove('show');
            knowMoreBtn.classList.remove('hidden');
            alert('Could not fetch more info.');
        }
    }
});
