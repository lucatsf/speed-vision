import { useState } from 'react';
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const usePdfReader = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pdf, setPdf] = useState(null);

  const onFileChange = (event) => {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        const typedArray = new Uint8Array(e.target.result);
        const loadingTask = pdfjs.getDocument(typedArray);
        try {
          const getPdf = await loadingTask.promise;
          setNumPages(getPdf.numPages);
          setPdf(getPdf);
        } catch (error) {
          console.error("Error during PDF extraction:", error);
        }
      };

      reader.readAsArrayBuffer(file);
      setFile(file);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const getTextFromPage = async (pageNumber) => {
    if (pageNumber > 0 && pdf) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');
      return text;
    }

  };

  const getTotalLength = async (pageNumber) => {
    if (pageNumber > 0) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');
      return text.length;
    }
  }

  return {
    file, numPages, onFileChange, onDocumentLoadSuccess, getTextFromPage, getTotalLength
  };
};

export default usePdfReader;
