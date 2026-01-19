const canvas = document.getElementById('invoiceCanvas');
const ctx = canvas.getContext('2d');
let invoiceHistory = JSON.parse(localStorage.getItem('invoiceHistory')) || [];
let templateImage = new Image();

canvas.width = 924;
canvas.height = 1308;

const today = new Date();
const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
document.getElementById('invoiceDate').value = formattedDate;

templateImage.src = 'AbuToys Invoice maker.png';

// ✅ Pehle image load ho
templateImage.onload = function() {
    generateInvoicePreview();
    // ✅ Image load hone ke BAAD font load karo
    loadFonts();
};

// Font load karne ka function
async function loadFonts() {
    const font = new FontFace('Montserrat', 'url(https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Ew-.woff2)');
    await font.load();
    document.fonts.add(font);
    generateInvoicePreview(); // Font load hone ke baad dubara generate
}

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', generateInvoicePreview);
});

function generateInvoicePreview() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);

    // === RIGHT SIDE ===
    ctx.textAlign = 'right';
    ctx.fillStyle = '#163d44';

    // Date - exactly under "Date:"
    const dateValue = document.getElementById('invoiceDate').value;
    if (dateValue) {
        ctx.font = '24px Montserrat';
        ctx.fillStyle = '#163d44';
        ctx.fillText(dateValue, 830, 380);
    }

    // Order Code - Red, Bold
    const orderCode = document.getElementById('orderCode').value;
    if (orderCode) {
        ctx.font = 'bold 26px Montserrat';
        ctx.fillStyle = '#ff5757';
        ctx.fillText(orderCode, 830, 450);
        ctx.fillStyle = '#163d44';
    }

    // Invoice No
    const invoiceNo = document.getElementById('invoiceNo').value;
    if (invoiceNo) {
        ctx.font = '24px Montserrat';
        ctx.fillText(invoiceNo, 830, 520);
    }

    // === LEFT SIDE - TO: ===
    ctx.textAlign = 'left';

    // Customer Name - Bold & Big
    const customerName = document.getElementById('customerName').value;
    if (customerName) {
        ctx.font = 'bold 30px Montserrat';
        ctx.fillText(customerName, 95, 395);
    }

    // Phone
    const customerPhone = document.getElementById('customerPhone').value;
    if (customerPhone) {
        ctx.font = '26px Montserrat';
        ctx.fillText(customerPhone, 95, 430);
    }

    // Email
    const customerEmail = document.getElementById('customerEmail').value;
    if (customerEmail) {
        ctx.font = '26px Montserrat';
        ctx.fillText(customerEmail, 95, 460);
    }

    // Address (multi-line)
    const customerAddress = document.getElementById('customerAddress').value;
    if (customerAddress) {
        ctx.font = '26px Montserrat';
        const lines = wrapText(customerAddress, 480);
        lines.forEach((line, i) => {
            ctx.fillText(line, 95, 490 + i * 38);
        });
    }

   // === TABLE ===
ctx.textAlign = 'center';

// Toy Name
const toyName = document.getElementById('toyName').value;
if (toyName) {
    ctx.font = '26px Montserrat';
    ctx.fillText(toyName, 240, 685);
}

// Quantity
const qty = parseFloat(document.getElementById('quantity').value) || 0;
if (qty > 0) {
    ctx.fillText(qty.toString(), 445, 685);
}

// Rate
const rate = parseFloat(document.getElementById('rate').value) || 0;
if (rate > 0) {
    ctx.fillText('₹' + rate, 600, 685);
}

// Toy Total (qty * rate)
const toyTotal = qty * rate;
if (toyTotal > 0) {
    ctx.fillText('₹' + toyTotal, 750, 685);
}

// Discount Calculation (qty-based: 1% for qty 1, 2% for qty 2, etc.)
const discountPercent = qty; // 1% per quantity
const discountAmount = (toyTotal * discountPercent) / 100;
const subtotal = toyTotal - discountAmount;

// Discount Row - Show discount percentage
if (discountPercent > 0) {
    ctx.font = 'bold 26px Montserrat';
    ctx.fillStyle = '#00bf63';
    ctx.fillText(discountPercent + '%', 445, 750); // QTY column mein percentage
    
    // Discount amount in TOTAL column
    ctx.font = 'bold 26px Montserrat';
    ctx.fillStyle = '#00bf63'; // Red color for discount
    ctx.fillText('-' + discountAmount.toFixed(0) + '₹', 600, 750);
    ctx.fillStyle = '#163d44'; // Reset color
}

// Grand Total - 1st place: Niche right side pe
if (subtotal > 0) {
    ctx.textAlign = 'right';
    ctx.font = 'bold 28px Montserrat';
    ctx.fillStyle = '#00bf63';
    ctx.fillText('₹' + subtotal.toFixed(0), 780, 750);
}

// Dispatch/Handling Charge Row
const dispatchCharge = parseFloat(document.getElementById('dispatchCharge').value) || 0;

if (dispatchCharge > 0) {
    ctx.font = 'bold 26px Montserrat';
    ctx.fillStyle = '#163d44';
    ctx.fillText('₹' + dispatchCharge, 460, 815); // TOTAL column mein dispatch charge
}

// Transaction ID
ctx.textAlign = 'left';
const transactionId = document.getElementById('transactionId').value;
if (transactionId) {
    ctx.font = '24px Montserrat';
    ctx.fillText(transactionId, 260, 975);
}

// Grand Total Calculation (subtotal + dispatch charge)
const grandTotal = subtotal + dispatchCharge;

// Grand Total - 1st place: Niche right side pe
if (grandTotal > 0) {
    ctx.textAlign = 'right';
    ctx.font = 'bold 52px Montserrat';
    ctx.fillStyle = '#00bf63';
    ctx.fillText('₹' + grandTotal.toFixed(0), 820, 1000);
}

// Grand Total - 2nd place: Table ke end mein (optional - agar chahiye to)
// Agar table mein bhi grand total chahiye, to yeh uncomment kar dena:

// Grand Total - 1st place: Niche right side pe
if (subtotal > 0) {
    ctx.textAlign = 'right';
    ctx.font = 'bold 28px Montserrat';
    ctx.fillStyle = '#00bf63';
    ctx.fillText('₹' + subtotal.toFixed(0), 630, 820);
}

if (grandTotal > 0) {
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px Montserrat';
    ctx.fillStyle = '#00bf63';
    ctx.fillText('₹' + grandTotal.toFixed(0), 750, 820); // Adjust Y position as needed
    ctx.fillStyle = '#163d44';
}

function wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    ctx.font = '24px Montserrat';
    for (let word of words) {
        const testLine = currentLine + word + ' ';
        if (ctx.measureText(testLine).width > maxWidth && currentLine !== '') {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine.trim());
    return lines;
}
}

function downloadInvoice() {
    const form = document.getElementById('invoiceForm');
    if (!form.checkValidity()) {
        alert('Please fill all required fields!');
        form.reportValidity();
        return;
    }

    generateInvoicePreview();

    const qty = parseFloat(document.getElementById('quantity').value) || 0;
    const rate = parseFloat(document.getElementById('rate').value) || 0;
    const dispatchCharge = parseFloat(document.getElementById('dispatchCharge').value) || 0;

    const invoiceData = {
        id: Date.now(),
        invoiceNo: document.getElementById('invoiceNo').value,
        imageData: canvas.toDataURL('image/png', 1.0),
        total: (qty * rate) + dispatchCharge  // Updated total
    };

    invoiceHistory.unshift(invoiceData);
    localStorage.setItem('invoiceHistory', JSON.stringify(invoiceHistory));

    const link = document.createElement('a');
    link.download = `AbuToys_Invoice_${invoiceData.invoiceNo || 'New'}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();

    alert('Invoice downloaded successfully! ✔');
}

// History functions (same as before)
function showHistory() {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('historySection').classList.add('active');
    loadHistory();
}

function hideHistory() {
    document.getElementById('mainContent').style.display = 'flex';
    document.getElementById('historySection').classList.remove('active');
}

function loadHistory() {
    const grid = document.getElementById('historyGrid');
    grid.innerHTML = '';

    if (invoiceHistory.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">No invoices in history yet. Create your first invoice!</p>';
        return;
    }

    invoiceHistory.forEach(invoice => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <h3>${invoice.invoiceNo}</h3>
            <p><strong>Total:</strong> ₹${invoice.total}</p>
            <div class="history-actions">
                <button class="btn-small btn-view" onclick="viewInvoice(${invoice.id})">View</button>
                <button class="btn-small btn-delete" onclick="deleteInvoice(${invoice.id})">Delete</button>
            </div>
        `;
        grid.appendChild(item);
    });
}

function viewInvoice(id) {
    const invoice = invoiceHistory.find(inv => inv.id === id);
    if (invoice) {
        const link = document.createElement('a');
        link.download = `AbuToys_Invoice_${invoice.invoiceNo}.png`;
        link.href = invoice.imageData;
        link.click();
    }
}

function deleteInvoice(id) {
    if (confirm('Are you sure you want to delete this invoice from history?')) {
        invoiceHistory = invoiceHistory.filter(inv => inv.id !== id);
        localStorage.setItem('invoiceHistory', JSON.stringify(invoiceHistory));
        loadHistory();
    }
}
