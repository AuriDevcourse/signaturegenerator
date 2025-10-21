document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('upload-btn');
    const photoUpload = document.getElementById('photo-upload');
    const cropModal = document.getElementById('crop-modal');
    const cropImage = document.getElementById('crop-image');
    const cancelCropBtn = document.getElementById('cancel-crop-btn');
    const cropAndUploadBtn = document.getElementById('crop-and-upload-btn');
    const brightnessSlider = document.getElementById('brightness');
    const saturationSlider = document.getElementById('saturation');
    let cropper;

    uploadBtn.addEventListener('click', () => photoUpload.click());

    photoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            cropImage.src = event.target.result;
            cropModal.classList.remove('hidden');
            cropper = new Cropper(cropImage, {
                aspectRatio: 1,
                viewMode: 1,
                background: false,
            });
        };
        reader.readAsDataURL(file);

        // Reset sliders
        brightnessSlider.value = 100;
        saturationSlider.value = 100;
    });

    const applyImageFilters = () => {
        if (!cropper) return;
        const brightness = brightnessSlider.value;
        const saturation = saturationSlider.value;
        // The cropper's image element is what we need to style
        const cropperImage = cropModal.querySelector('.cropper-view-box img');
        if(cropperImage) {
             cropperImage.style.filter = `brightness(${brightness}%) saturate(${saturation}%)`;
        }
    };

    brightnessSlider.addEventListener('input', applyImageFilters);
    saturationSlider.addEventListener('input', applyImageFilters);

    cancelCropBtn.addEventListener('click', () => {
        cropModal.classList.add('hidden');
        if (cropper) {
            cropper.destroy();
        }
    });

    cropAndUploadBtn.addEventListener('click', () => {
        if (!cropper) return;

        cropAndUploadBtn.textContent = 'Uploading...';
        cropAndUploadBtn.disabled = true;

        const croppedCanvas = cropper.getCroppedCanvas({
            width: 800, // Upload a slightly larger image for quality
            height: 800,
        });

        // Create a new canvas to apply filters
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = 800;
        finalCanvas.height = 800;
        const ctx = finalCanvas.getContext('2d');

        // Apply filters to the context
        const brightness = brightnessSlider.value;
        const saturation = saturationSlider.value;
        ctx.filter = `brightness(${brightness}%) saturate(${saturation}%)`;

        // Draw the cropped image onto the new canvas with the filters
        ctx.drawImage(croppedCanvas, 0, 0);

        finalCanvas.toBlob((blob) => {
            const formData = new FormData();
            formData.append('file', blob, 'signature-photo.png');

            const siteUrl = 'https://techbbq.dk/';
            const username = 'Auri';
            const appPassword = 'PvOF ok6v UsZ7 7847 m6FZ Ekwh';

            fetch(`${siteUrl}wp-json/wp/v2/media`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${username}:${appPassword}`),
                    'Content-Disposition': 'attachment; filename=signature-photo.png'
                },
                body: formData,
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Upload failed. Please check credentials and permissions.');
                }
                return response.json();
            })
            .then(media => {
                document.getElementById('photo').value = media.source_url;
                updatePreview();
                alert('Image uploaded successfully!');
            })
            .catch(error => {
                console.error('WordPress Upload Error:', error);
                alert(error.message);
            })
            .finally(() => {
                cropModal.classList.add('hidden');
                if (cropper) {
                    cropper.destroy();
                }
                cropAndUploadBtn.textContent = 'Crop & Upload';
                cropAndUploadBtn.disabled = false;
            });
        }, 'image/png');
    });

    const form = document.getElementById('signature-form');
    const copyBtn = document.getElementById('copy-btn');
    const desktopPreview = document.getElementById('desktop-preview');
    const mobilePreview = document.getElementById('mobile-preview');

    const updatePreview = () => {
        const name = document.getElementById('name').value;
        const jobTitle = document.getElementById('job-title').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const website = document.getElementById('website').value;
        const linkedin = document.getElementById('linkedin').value;
        const photo = document.getElementById('photo').value;
        const message = document.getElementById('message').value;

        const signatureHTML = `
            <table style="width: 500px; font-family: 'Inter', sans-serif; font-size: 12px; color: #111111;">
                <tr>
                    <td style="width: 100px; vertical-align: top;">
                        ${photo ? `<img src="${photo}" alt="${name}" style="width: 80px; height: 80px; border-radius: 0; object-fit: cover;">` : ''}
                    </td>
                    <td style="vertical-align: top; padding-left: 15px; border-left: 2px solid #F48022; color: inherit;">
                        <p style="margin: 0; font-family: 'Playfair Display', serif; font-size: 16px; font-weight: bold; color: inherit;">${name}</p>
                        <p style="margin: 2px 0; color: inherit;">${jobTitle}</p>
                        <hr style="border: none; height: 1px; background-color: #ccc; margin: 8px 0;">
                        <p style="margin: 2px 0; color: inherit;"><strong>E:</strong> <a href="mailto:${email}" style="color: #F48022; text-decoration: none;">${email}</a></p>
                        ${phone ? `<p style="margin: 2px 0; color: inherit;"><strong>P:</strong> ${phone}</p>` : ''}
                        ${website ? `<p style="margin: 2px 0; color: inherit;"><strong>W:</strong> <a href="${website}" style="color: #F48022; text-decoration: none;">${website}</a></p>` : ''}
                        ${linkedin ? `<p style="margin: 2px 0; color: inherit;"><a href="${linkedin}" style="color: #F48022; text-decoration: none;">LinkedIn Profile</a></p>` : ''}
                        ${message ? `<p style="margin-top: 10px; font-style: italic; color: #555;">${message}</p>` : ''}
                    </td>
                </tr>
            </table>
        `;

        desktopPreview.innerHTML = signatureHTML;

        const mobileSignatureHTML = `
            <div style="font-family: 'Inter', sans-serif; font-size: 12px; color: #f1f1f1; padding: 10px;">
                <div style="text-align: center;">
                    ${photo ? `<img src="${photo}" alt="${name}" style="width: 80px; height: 80px; border-radius: 0; object-fit: cover; margin: 0 auto 10px;">` : ''}
                    <p style="margin: 0; font-family: 'Playfair Display', serif; font-size: 16px; font-weight: bold; color: inherit;">${name}</p>
                    <p style="margin: 2px 0 10px; color: inherit;">${jobTitle}</p>
                </div>
                <hr style="border: none; height: 1px; background-color: #555; margin: 8px 0;">
                <div style="text-align: center;">
                    <p style="margin: 2px 0; color: inherit;"><strong>E:</strong> <a href="mailto:${email}" style="color: #F48022; text-decoration: none;">${email}</a></p>
                    ${phone ? `<p style="margin: 2px 0; color: inherit;"><strong>P:</strong> ${phone}</p>` : ''}
                    ${website ? `<p style="margin: 2px 0; color: inherit;"><strong>W:</strong> <a href="${website}" style="color: #F48022; text-decoration: none;">${website}</a></p>` : ''}
                    ${linkedin ? `<p style="margin: 2px 0; color: inherit;"><a href="${linkedin}" style="color: #F48022; text-decoration: none;">LinkedIn</a></p>` : ''}
                    ${message ? `<p style="margin-top: 10px; font-style: italic; color: #ccc;">${message}</p>` : ''}
                </div>
            </div>
        `;
        mobilePreview.innerHTML = mobileSignatureHTML;

        const hasContent = name || jobTitle || email;
        if (hasContent) {
            copyBtn.classList.remove('hidden');
        } else {
            copyBtn.classList.add('hidden');
        }
    };

    form.addEventListener('input', updatePreview);

    copyBtn.addEventListener('click', () => {
        const signatureContent = desktopPreview.innerHTML;
        // Use the Clipboard API for rich text if available
        try {
            const blob = new Blob([signatureContent], { type: 'text/html' });
            const item = new ClipboardItem({ 'text/html': blob });
            navigator.clipboard.write([item]).then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy Signature';
                }, 2000);
            });
        } catch (e) {
            // Fallback for older browsers
            navigator.clipboard.writeText(signatureContent).then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy Signature';
                }, 2000);
            });
        }
    });

    // Initial preview on load
    updatePreview();
});
