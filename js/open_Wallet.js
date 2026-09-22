const walletContainer = document.querySelector(".wallet-container");
const walletIcon = document.querySelector(".nav-item:nth-child(3)");

walletIcon.addEventListener("click", (e) => {
  e.stopPropagation();
  walletContainer.classList.add("active");
});

document.addEventListener("click", (e) => {
  const isInsideWallet = walletContainer.contains(e.target);
  const isWalletIcon = walletIcon.contains(e.target);
  if (!isInsideWallet && !isWalletIcon) {
    walletContainer.classList.remove("active");
  }
});
