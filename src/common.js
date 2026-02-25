// メニュー読み込み関数
async function loadMenu() {
    const responseMenu   = await fetch('menu.html');
    const responseFooter = await fetch('footer.html');

    const menuHtml   = await responseMenu.text();
    const footerHtml = await responseFooter.text();

    document.getElementById('menu').innerHTML   = menuHtml;
    document.getElementById('footer').innerHTML = footerHtml;
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', loadMenu);
