import { useEffect, useRef, useState } from "react";
import { debounce } from 'lodash';
import "./App.css";
import useSprayReader from "./hooks/useSprayReader";
import usePdfReader from "./hooks/usePdfReader";

localStorage.setItem('stopRead', false);

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [handlePage, setHandlePage] = useState(0);

  const { file, numPages, onFileChange, getTextFromPage } = usePdfReader();
  const {
    setInput,
    wpm,
    setWpm,
    start,
    stop,
    currentWord,
    isRunning
  } = useSprayReader();

  const fileInputRef = useRef(null);

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleStart = async (page = 1) => {
    if (wpm) {
      setWpm(wpm);
    }
     if (numPages && numPages > 0) {
      page = handlePage != 0 ? handlePage : page;
      const text = await getTextFromPage(page)
      setHandlePage(0);
      setInput(text);
      start();
    }
  };

  const handleStop = debounce(() => {
    stop();
  }, 300);

  const handleNextPage = () => {
    setHandlePage(currentPage + 1)
    setCurrentPage(currentPage + 1);
  }

  const handlePrevPage = () => {
    setHandlePage(currentPage - 1)
    setCurrentPage(currentPage - 1);
  }

  useEffect(() => {
    if (!isRunning) {
      console.log("A leitura parou vamos para proxima pagina");
      if (currentPage < numPages) {
        setCurrentPage(currentPage + 1);
        handleStart(currentPage + 1);
      }
    }
  }, [isRunning]);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <div className="text-center">
          <span >&#1092;</span>
        </div>
        <div className="text-center text-4xl font-mono">
          {currentWord}
        </div>
      </div>

      <form className="form-horizontal w-full max-w-lg mx-auto">
        <fieldset className="space-y-4">
          <div className="form-group">
            <label
              htmlFor="wpm"
              className="block text-lg font-medium text-gray-800"
            >
              Palavras por minuto
            </label>
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={wpm}
              onChange={(e) => setWpm(e.target.value)}
            >
              <option value="100">100 wpm</option>
              <option value="200">200 wpm</option>
              <option value="300">300 wpm</option>
              <option value="400">400 wpm</option>
              <option value="450">450 wpm</option>
              <option value="500">500 wpm</option>
              <option value="550">550 wpm</option>
              <option value="600">600 wpm</option>
            </select>
          </div>

          <div className="form-group flex justify-between">
            <button
              type="button"
              className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-800 hover:bg-green-700"
              onClick={() => {
                localStorage.setItem('stopRead', false);
                handleStart()
              }}
            >
              Iniciar
            </button>
            <button
              type="button"
              disabled={false}
              className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700"
              onClick={handlePrevPage}
            >
              Voltar pagina
            </button>
            <button
              type="button"
              disabled={false}
              className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700"
              onClick={handleNextPage}
            >
              Proxima pagina
            </button>
            <button
              type="button"
              className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-800 hover:bg-red-700"
              onClick={handleStop}
            >
              Parar
            </button>
          </div>
          <div className="form-group flex-row justify-between space-x-4">
            <div>
              <button
                type="button"
                className="w-full px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700"
                onClick={handleFileInputClick}
              >
                Selecione um arquivo
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={onFileChange}
                accept="application/pdf"
              />
              {file && (
                <div className="max-w-xs pt-10 text-lg font-medium text-gray-800">
                  <p className="truncate" title={file.name}>Arquivo: {file.name}</p>
                  <p>Total de páginas: {numPages}</p>
                  <p>Página atual: {currentPage}</p>
                </div>
              )}
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default App;
