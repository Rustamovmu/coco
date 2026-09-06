$(function () {
  $(".advance-order").on("click", async function () {
    const button = this;
    const card = button.closest("[data-order-id]");
    const orderId = card.dataset.orderId;
    const orderStatus = button.dataset.nextStatus;
    if (!confirm(`Change this order to ${orderStatus.toLowerCase()}?`)) return;
    button.disabled = true;
    try {
      await axios.post(`/admin/order/${orderId}/status`, { orderStatus });
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Order update failed. Please try again.");
      button.disabled = false;
    }
  });
});
