$(function () {
    const collection = $("#product-collection"),
        clothingSizeField = $("#product-size-field"),
        shoeSizeField = $("#product-shoe-size-field"),
        formPanel = $("#product-form-panel"),
        openFormButton = $("#process-btn")

    function updateSizeField() {
        const isShoe = collection.val() === "SHOES";
        clothingSizeField.prop("hidden", isShoe);
        shoeSizeField.prop("hidden", !isShoe);
        clothingSizeField.find('input[name="productSizes"]').prop("disabled", isShoe);
        shoeSizeField.find('input[name="productSizes"]').prop("disabled", !isShoe);
        const visibleSizes = (isShoe ? shoeSizeField : clothingSizeField).find('input[name="productSizes"]');
        if (!visibleSizes.filter(":checked").length) visibleSizes.first().prop("checked", true);
    }

    function setProductFormOpen(isOpen) {
        openFormButton.attr("aria-expanded", String(isOpen));

        if (isOpen) {
           const panelTop = formPanel
                .prop("hidden", false)
                .css("visibility", "hidden")
                .show()
                .offset().top;

            formPanel
                .hide()
                .css("visibility", "")
                .stop(true, true)
                .slideDown(500);

            $("html, body")
                .stop(true)
                .animate({ scrollTop: panelTop - 24 }, 500);

                $("#product-name").trigger("focus");
        } else {
            formPanel.stop(true, true).slideUp(500, () => formPanel.prop("hidden", true));
        }
    }

    collection.on("change", updateSizeField);
    clothingSizeField.on("change", 'input[name="productSizes"]', function () {
        const oneSize = this.value === "ONESIZE";
        if (oneSize && this.checked) {
            clothingSizeField.find('input[name="productSizes"]').not(this).prop("checked", false);
        } else if (this.checked) {
            clothingSizeField.find('input[value="ONESIZE"]').prop("checked", false);
        }
    });
    updateSizeField();

    openFormButton.on("click", () => setProductFormOpen(formPanel.prop("hidden")));
    $(".empty-add-product").on("click", () => setProductFormOpen(true));
    $("#cancel-btn, #form-cancel-btn").on("click", () => setProductFormOpen(false));

    $(".product-image").on("change", function () {
        const file = this.files?.[0],
            slot = $(this).closest(".upload-slot"),
            label = slot.find(".upload-slot-name"),
            preview = slot.find(".upload-preview"),
            previousPreviewUrl = slot.data("previewUrl");

        if (previousPreviewUrl) URL.revokeObjectURL(previousPreviewUrl);

        slot.toggleClass("has-file", Boolean(file));
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            slot.data("previewUrl", previewUrl);
            preview.attr("src", previewUrl).prop("hidden", false);
            label.text(file.name);
        } else {
            slot.removeData("previewUrl");
            preview.removeAttr("src").prop("hidden", true);
            label.text(this.required ? "Cover image" : "Add image");
        }
    });


    $("[data-product-gallery]").each(function () {
        const gallery = $(this),
            images = gallery.find("[data-product-gallery-image]"),
            counter = gallery.find(".product-gallery-index");
        let currentIndex = 0;

        function showImage(index) {
            currentIndex = (index + images.length) % images.length;
            images.prop("hidden", true).removeClass("is-active");
            images.eq(currentIndex).prop("hidden", false).addClass("is-active");
            counter.text(`${currentIndex + 1} / ${images.length}`);
        }

        gallery.on("click", ".product-gallery-control", function () {
            const direction = this.dataset.galleryAction === "next" ? 1 : -1;
            showImage(currentIndex + direction);
        });
    });

    $(".new-product-status").on("change", async function (event) {
        const select = event.currentTarget,
            id = select.dataset.productId,
            productStatus = select.value;

        if (!id) return;

        select.classList.toggle("status--deleted", productStatus === "DELETE");
        select.classList.toggle("status--processing", productStatus === "PROCESS");
        select.disabled = true;
        try {
            const response = await axios.post(`/admin/product/${id}`, { productStatus });
            if (!response.data.data) alert("Product update failed!");
        } catch (error) {
            console.error(error);
            alert("Product update failed!");
        } finally {
            select.disabled = false;
        }
    });
});

function validateForm() {
    const coverImage = document.querySelector(".product-image");
    const selectedSizes = document.querySelectorAll('input[name="productSizes"]:checked:not(:disabled)');

    if (!selectedSizes.length) {
        alert("Please choose at least one available size.");
        return false;
    }

    if (!coverImage?.files?.length) {
        alert("Please add a cover image for the product.");
        return false;
    }

    return true;
}
