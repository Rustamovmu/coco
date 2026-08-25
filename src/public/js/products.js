$(function () {
    const collection = $("#product-collection");
    const clothingSizeField = $("#product-size-field");
    const shoeSizeField = $("#product-shoe-size-field");
    const clothingSize = $("#product-size");
    const shoeSize = $("#product-shoe-size");
    const formPanel = $("#product-form-panel");
    const openFormButton = $("#process-btn");

    function updateSizeField() {
        const isShoe = collection.val() === "SHOES";
        clothingSizeField.prop("hidden", isShoe);
        shoeSizeField.prop("hidden", !isShoe);
        clothingSize.prop("disabled", isShoe);
        shoeSize.prop("disabled", !isShoe);
    }

    function setProductFormOpen(isOpen) {
        formPanel.prop("hidden", !isOpen);
        openFormButton.attr("aria-expanded", String(isOpen));

        if (isOpen) {
            formPanel.get(0)?.scrollIntoView({ behavior: "smooth", block: "start" });
            $("#product-name").trigger("focus");
        }
    }

    collection.on("change", updateSizeField);
    updateSizeField();

    openFormButton.on("click", () => setProductFormOpen(true));
    $(".empty-add-product").on("click", () => setProductFormOpen(true));
    $("#cancel-btn, #form-cancel-btn").on("click", () => setProductFormOpen(false));

    $(".product-image").on("change", function () {
        const file = this.files?.[0];
        const slot = $(this).closest(".upload-slot");
        const label = slot.find(".upload-slot-name");
        const preview = slot.find(".upload-preview");
        const previousPreviewUrl = slot.data("previewUrl");

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

    $(".new-product-status").on("change", async function (event) {
        const select = event.currentTarget;
        const id = select.dataset.productId;
        const productStatus = select.value;

        if (!id) return;

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

    if (!coverImage?.files?.length) {
        alert("Please add a cover image for the product.");
        return false;
    }

    return true;
}
