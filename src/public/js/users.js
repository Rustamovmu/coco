$(function () {
    $(".member-status").on("change", async function () {
        const select = this;
        const id = select.id;
        const memberStatus = select.value;

        select.classList.remove("status--active", "status--block", "status--delete");
        select.classList.add(`status--${memberStatus.toLowerCase()}`);
        select.disabled = true;
        try {
            const response = await axios.post("/admin/user/edit", {
                _id: id,
                memberStatus,
            });

            if (!response.data.data) throw new Error("User update failed");
            select.blur();
        } catch (error) {
            console.error(error);
            alert("User update failed. Please try again.");
        } finally {
            select.disabled = false;
        }
    });
});
