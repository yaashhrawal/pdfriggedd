const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function testSplit() {
    try {
        // Create a dummy 3-page PDF
        const pdfDoc = await PDFDocument.create();
        pdfDoc.addPage([500, 500]);
        pdfDoc.addPage([500, 500]);
        pdfDoc.addPage([500, 500]);
        const pdfBytes = await pdfDoc.save();
        console.log("Original PDF size:", pdfBytes.length);

        // Load it back
        const pdf = await PDFDocument.load(pdfBytes);
        const totalPages = pdf.getPageCount();
        console.log("Total pages:", totalPages);

        // Split: keep page 2 (index 1)
        const pageIndices = [1];
        console.log("Keeping page index:", pageIndices);

        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdf, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const newPdfBytes = await newPdf.save();
        console.log("New PDF size:", newPdfBytes.length);

        const newPdfLoaded = await PDFDocument.load(newPdfBytes);
        console.log("New PDF pages:", newPdfLoaded.getPageCount());

        if (newPdfLoaded.getPageCount() === 1) {
            console.log("SUCCESS: Split worked correctly.");
        } else {
            console.log("FAILURE: Split did not work.");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

testSplit();
