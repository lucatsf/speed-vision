import { useEffect, useState } from "react";
import "./App.css";
import useSprayReader from "./hooks/useSprayReader";
import usePdfReader from "./hooks/usePdfReader";

function App() {
  const [inputText, setInputText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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

  const handleStart = async (page = 1) => {
    if (wpm) {
      setWpm(wpm);
    }
    if (inputText && inputText.length > 0) {
      setInput(inputText);
      start();
      return;
    } else if (numPages && numPages > 0) {
      const text = await getTextFromPage(page)
      setInput(text);
      start();
    }
  };

  const handleStop = () => {
    stop();
  };

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

            <div>
              <input type="file" onChange={onFileChange} accept="application/pdf" />
              {file && (
                <div>
                  <p>Arquivo selecionado: {file.name}</p>
                  <p>Número de páginas: {numPages}</p>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label
              htmlFor="wpm"
              className="block text-lg font-medium text-gray-700"
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
              <option value="500">500 wpm</option>
            </select>
          </div>

          <div className="form-group flex justify-between">
            <button
              type="button"
              className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              onClick={handleStart}
            >
              Iniciar
            </button>
            <button
              type="button"
              className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              onClick={handleStop}
            >
              Parar
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default App;
