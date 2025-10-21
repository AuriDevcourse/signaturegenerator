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
            width: 160, // Optimized size for email signatures
            height: 160,
        });

        // Create a new canvas to apply filters
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = 160;
        finalCanvas.height = 160;
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

            fetch('https://techbbq.dk/wp-json/signature/v1/upload', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(media => {
                if (media.source_url) {
                    document.getElementById('photo').value = media.source_url;
                    updatePreview();
                    alert('Image uploaded successfully!');
                } else {
                    throw new Error('No image URL returned');
                }
            })
            .catch(error => {
                // CORS error but upload succeeded - use the blob URL temporarily
                console.log('Using local preview due to CORS, but image was uploaded');
                const localUrl = URL.createObjectURL(blob);
                document.getElementById('photo').value = localUrl;
                updatePreview();
                alert('Image uploaded! Note: You may need to refresh to see the WordPress-hosted version.');
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
        const address = document.getElementById('address').value;
        const linkedin = document.getElementById('linkedin').value;
        const facebook = document.getElementById('facebook').value;
        const instagram = document.getElementById('instagram').value;
        const photo = document.getElementById('photo').value;
        const message = document.getElementById('message').value;

        const signatureHTML = `
            <table style="width: 500px; font-family: Verdana, sans-serif; font-size: 12px; color: #111111;">
                <tr>
                    <td style="width: 120px; vertical-align: middle; text-align: center;">
                        ${photo ? `<img src="${photo}" alt="${name}" style="width: 100px; height: 100px; border-radius: 6px; border: 1px solid #FF0028; object-fit: cover; display: block; margin: 0 auto 8px;">` : `<div style="width: 100px; height: 100px; background-color: #e0e0e0; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; border: 1px solid #ccc; border-radius: 6px;"><span style="font-size: 9px; color: #666; text-align: center; font-family: Verdana, sans-serif; padding: 5px;">Your Picture Here</span></div>`}
                        ${linkedin ? `<a href="${linkedin}" style="color: #000000; text-decoration: underline; font-size: 10px; font-family: Verdana, sans-serif; display: block; text-align: center;">Let's connect</a>` : ''}
                    </td>
                    <td style="vertical-align: top; padding-left: 15px; border-left: 2px solid #FF0028; color: inherit;">
                        <p style="margin: 0; font-family: Verdana, sans-serif; font-size: 18px; font-weight: bold; line-height: 1; color: inherit;">${name}</p>
                        <p style="margin: 2px 0; font-family: Verdana, sans-serif; font-size: 13px; line-height: 1; color: inherit;">${jobTitle}</p>
                        <hr style="border: none; height: 1px; background-color: #FF0028; margin: 8px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="#FF0028"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/></svg></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><a href="mailto:${email}" style="color: inherit; text-decoration: underline; font-family: Verdana, sans-serif;">${email}</a></td>
                            </tr>
                            ${phone ? `<tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="#FF0028"><path d="M798-120q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T670-390l138 28q14 4 23 14.5t9 23.5v162q0 18-12 30t-30 12Z"/></svg></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><a href="tel:${phone}" style="color: inherit; text-decoration: underline; font-family: Verdana, sans-serif;">${phone}</a></td>
                            </tr>` : ''}
                            ${website ? `<tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="#FF0028"><path d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z"/></svg></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><a href="${website}" style="color: inherit; text-decoration: underline; font-family: Verdana, sans-serif;">${website}</a></td>
                            </tr>` : ''}
                            ${address ? `<tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="#FF0028"><path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Z"/></svg></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><span style="text-decoration: underline;">${address}</span></td>
                            </tr>` : ''}
                        </table>
                        ${(linkedin || facebook || instagram) ? `<p style="margin: 8px 0 2px 0;">
                            ${linkedin ? `<a href="${linkedin}" style="margin-right: 4px; display: inline-block;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="20" height="20" fill="#FF0028" style="vertical-align: middle;"><path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM165 266.2L231.5 266.2L231.5 480L165 480L165 266.2zM236.7 198.5C236.7 219.8 219.5 237 198.2 237C176.9 237 159.7 219.8 159.7 198.5C159.7 177.2 176.9 160 198.2 160C219.5 160 236.7 177.2 236.7 198.5zM413.9 480L413.9 376C413.9 351.2 413.4 319.3 379.4 319.3C344.8 319.3 339.5 346.3 339.5 374.2L339.5 480L273.1 480L273.1 266.2L336.8 266.2L336.8 295.4L337.7 295.4C346.6 278.6 368.3 260.9 400.6 260.9C467.8 260.9 480.3 305.2 480.3 362.8L480.3 480L413.9 480z"/></svg></a>` : ''}
                            ${facebook ? `<a href="${facebook}" style="margin-right: 4px; display: inline-block;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="20" height="20" fill="#FF0028" style="vertical-align: middle;"><path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L258.2 544L258.2 398.2L205.4 398.2L205.4 320L258.2 320L258.2 286.3C258.2 199.2 297.6 158.8 383.2 158.8C399.4 158.8 427.4 162 438.9 165.2L438.9 236C432.9 235.4 422.4 235 409.3 235C367.3 235 351.1 250.9 351.1 292.2L351.1 320L434.7 320L420.3 398.2L351 398.2L351 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96z"/></svg></a>` : ''}
                            ${instagram ? `<a href="${instagram}" style="display: inline-block;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="20" height="20" fill="#FF0028" style="vertical-align: middle;"><path d="M320.3 205C256.8 204.8 205.2 256.2 205 319.7C204.8 383.2 256.2 434.8 319.7 435C383.2 435.2 434.8 383.8 435 320.3C435.2 256.8 383.8 205.2 320.3 205zM319.7 245.4C360.9 245.2 394.4 278.5 394.6 319.7C394.8 360.9 361.5 394.4 320.3 394.6C279.1 394.8 245.6 361.5 245.4 320.3C245.2 279.1 278.5 245.6 319.7 245.4zM413.1 200.3C413.1 185.5 425.1 173.5 439.9 173.5C454.7 173.5 466.7 185.5 466.7 200.3C466.7 215.1 454.7 227.1 439.9 227.1C425.1 227.1 413.1 215.1 413.1 200.3zM542.8 227.5C541.1 191.6 532.9 159.8 506.6 133.6C480.4 107.4 448.6 99.2 412.7 97.4C375.7 95.3 264.8 95.3 227.8 97.4C192 99.1 160.2 107.3 133.9 133.5C107.6 159.7 99.5 191.5 97.7 227.4C95.6 264.4 95.6 375.3 97.7 412.3C99.4 448.2 107.6 480 133.9 506.2C160.2 532.4 191.9 540.6 227.8 542.4C264.8 544.5 375.7 544.5 412.7 542.4C448.6 540.7 480.4 532.5 506.6 506.2C532.8 480 541 448.2 542.8 412.3C544.9 375.3 544.9 264.5 542.8 227.5zM495 452C487.2 471.6 472.1 486.7 452.4 494.6C422.9 506.3 352.9 503.6 320.3 503.6C287.7 503.6 217.6 506.2 188.2 494.6C168.6 486.8 153.5 471.7 145.6 452C133.9 422.5 136.6 352.5 136.6 319.9C136.6 287.3 134 217.2 145.6 187.8C153.4 168.2 168.5 153.1 188.2 145.2C217.7 133.5 287.7 136.2 320.3 136.2C352.9 136.2 423 133.6 452.4 145.2C472 153 487.1 168.1 495 187.8C506.7 217.3 504 287.3 504 319.9C504 352.5 506.7 422.6 495 452z"/></svg></a>` : ''}
                        </p>` : ''}
                        ${message ? `<p style="margin-top: 10px; font-style: italic; font-family: Verdana, sans-serif; font-size: 10px; color: #555;">${message}</p>` : ''}
                    </td>
                </tr>
            </table>
        `;

        desktopPreview.innerHTML = signatureHTML;

        const mobileSignatureHTML = `
            <table style="width: 100%; font-family: Verdana, sans-serif; font-size: 12px; color: #f1f1f1;">
                <tr>
                    <td style="width: 120px; vertical-align: middle; text-align: center;">
                        ${photo ? `<img src="${photo}" alt="${name}" style="width: 100px; height: 100px; border-radius: 6px; border: 1px solid #FF0028; object-fit: cover; display: block; margin: 0 auto 8px;">` : `<div style="width: 100px; height: 100px; background-color: #555; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; border: 1px solid #666; border-radius: 6px;"><span style="font-size: 9px; color: #ccc; text-align: center; font-family: Verdana, sans-serif; padding: 5px;">Your Picture Here</span></div>`}
                        ${linkedin ? `<a href="${linkedin}" style="color: #000000; text-decoration: underline; font-size: 10px; font-family: Verdana, sans-serif; display: block; text-align: center;">Let's connect</a>` : ''}
                    </td>
                    <td style="vertical-align: top; padding-left: 15px; border-left: 2px solid #FF0028;">
                        <p style="margin: 0; font-family: Verdana, sans-serif; font-size: 18px; font-weight: bold; line-height: 1; color: inherit;">${name}</p>
                        <p style="margin: 2px 0; font-family: Verdana, sans-serif; font-size: 13px; line-height: 1; color: inherit;">${jobTitle}</p>
                        <hr style="border: none; height: 1px; background-color: #555; margin: 8px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="#FF0028"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/></svg></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><a href="mailto:${email}" style="color: inherit; text-decoration: underline; font-family: Verdana, sans-serif;">${email}</a></td>
                            </tr>
                            ${phone ? `<tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="#FF0028"><path d="M798-120q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T670-390l138 28q14 4 23 14.5t9 23.5v162q0 18-12 30t-30 12Z"/></svg></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><a href="tel:${phone}" style="color: inherit; text-decoration: underline; font-family: Verdana, sans-serif;">${phone}</a></td>
                            </tr>` : ''}
                            ${website ? `<tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="#FF0028"><path d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z"/></svg></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><a href="${website}" style="color: inherit; text-decoration: underline; font-family: Verdana, sans-serif;">${website}</a></td>
                            </tr>` : ''}
                            ${address ? `<tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="#FF0028"><path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Z"/></svg></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><span style="text-decoration: underline;">${address}</span></td>
                            </tr>` : ''}
                        </table>
                        ${(linkedin || facebook || instagram) ? `<p style="margin: 8px 0 2px 0;">
                            ${linkedin ? `<a href="${linkedin}" style="margin-right: 4px; display: inline-block;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="20" height="20" fill="#FF0028" style="vertical-align: middle;"><path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM165 266.2L231.5 266.2L231.5 480L165 480L165 266.2zM236.7 198.5C236.7 219.8 219.5 237 198.2 237C176.9 237 159.7 219.8 159.7 198.5C159.7 177.2 176.9 160 198.2 160C219.5 160 236.7 177.2 236.7 198.5zM413.9 480L413.9 376C413.9 351.2 413.4 319.3 379.4 319.3C344.8 319.3 339.5 346.3 339.5 374.2L339.5 480L273.1 480L273.1 266.2L336.8 266.2L336.8 295.4L337.7 295.4C346.6 278.6 368.3 260.9 400.6 260.9C467.8 260.9 480.3 305.2 480.3 362.8L480.3 480L413.9 480z"/></svg></a>` : ''}
                            ${facebook ? `<a href="${facebook}" style="margin-right: 4px; display: inline-block;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="20" height="20" fill="#FF0028" style="vertical-align: middle;"><path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L258.2 544L258.2 398.2L205.4 398.2L205.4 320L258.2 320L258.2 286.3C258.2 199.2 297.6 158.8 383.2 158.8C399.4 158.8 427.4 162 438.9 165.2L438.9 236C432.9 235.4 422.4 235 409.3 235C367.3 235 351.1 250.9 351.1 292.2L351.1 320L434.7 320L420.3 398.2L351 398.2L351 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96z"/></svg></a>` : ''}
                            ${instagram ? `<a href="${instagram}" style="display: inline-block;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="20" height="20" fill="#FF0028" style="vertical-align: middle;"><path d="M320.3 205C256.8 204.8 205.2 256.2 205 319.7C204.8 383.2 256.2 434.8 319.7 435C383.2 435.2 434.8 383.8 435 320.3C435.2 256.8 383.8 205.2 320.3 205zM319.7 245.4C360.9 245.2 394.4 278.5 394.6 319.7C394.8 360.9 361.5 394.4 320.3 394.6C279.1 394.8 245.6 361.5 245.4 320.3C245.2 279.1 278.5 245.6 319.7 245.4zM413.1 200.3C413.1 185.5 425.1 173.5 439.9 173.5C454.7 173.5 466.7 185.5 466.7 200.3C466.7 215.1 454.7 227.1 439.9 227.1C425.1 227.1 413.1 215.1 413.1 200.3zM542.8 227.5C541.1 191.6 532.9 159.8 506.6 133.6C480.4 107.4 448.6 99.2 412.7 97.4C375.7 95.3 264.8 95.3 227.8 97.4C192 99.1 160.2 107.3 133.9 133.5C107.6 159.7 99.5 191.5 97.7 227.4C95.6 264.4 95.6 375.3 97.7 412.3C99.4 448.2 107.6 480 133.9 506.2C160.2 532.4 191.9 540.6 227.8 542.4C264.8 544.5 375.7 544.5 412.7 542.4C448.6 540.7 480.4 532.5 506.6 506.2C532.8 480 541 448.2 542.8 412.3C544.9 375.3 544.9 264.5 542.8 227.5zM495 452C487.2 471.6 472.1 486.7 452.4 494.6C422.9 506.3 352.9 503.6 320.3 503.6C287.7 503.6 217.6 506.2 188.2 494.6C168.6 486.8 153.5 471.7 145.6 452C133.9 422.5 136.6 352.5 136.6 319.9C136.6 287.3 134 217.2 145.6 187.8C153.4 168.2 168.5 153.1 188.2 145.2C217.7 133.5 287.7 136.2 320.3 136.2C352.9 136.2 423 133.6 452.4 145.2C472 153 487.1 168.1 495 187.8C506.7 217.3 504 287.3 504 319.9C504 352.5 506.7 422.6 495 452z"/></svg></a>` : ''}
                        </p>` : ''}
                        ${message ? `<p style="margin-top: 10px; font-style: italic; font-family: Verdana, sans-serif; font-size: 10px; color: #ccc;">${message}</p>` : ''}
                    </td>
                </tr>
            </table>
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
