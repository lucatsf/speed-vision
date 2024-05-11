import "./App.css";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function App() {
  const [indicePalavra, setIndicePalavra] = useState(0);
  const [palavras, setPalavras] = useState(
    "Carregue um arquivo PDF para começar a leitura".split(" ")
  );
  const [executando, setExecutando] = useState(false);
  const [goNextPage, setGoNextPage] = useState(false);
  const [velocidade, setVelocidade] = useState(200);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [file, setFile] = useState(null);
  const [pdf, setPdf] = useState(null);

  const intervalRef = useRef(null);

  const splitText = (text) => {
    if (text && text.length > 0) {
      return text.trim().split(" ");
    }
  };

  const getCurrentPageText = async (pdfFile, pageNumber = 1) => {
    if (pdfFile) {
      const page = await pdfFile.getPage(pageNumber);
      const textContent = await page.getTextContent();

      if (textContent.items.length === 0) {
        setCurrentPage(pageNumber + 1);
        return await getCurrentPageText(pdfFile, pageNumber + 1);
      }

      let text = textContent.items.map((item) => item.str).join(" ");

      if (text.trim() === "") {
        setCurrentPage(pageNumber + 1);
        return await getCurrentPageText(pdfFile, pageNumber + 1);
      }

      text = text.replace(/\s+/g, " ");

      // Verifique se o texto não consiste apenas de espaços
      if (text.trim().length === 0) {
        text = "";
      }

      return text;
    }
  };

  const loadLastReading = async (fileNname) => {
    try {
      if (fileNname && fileNname.length > 0) {
        const titlebook = fileNname
          .trim()
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9]/g, "");

        const data = { read: `${titlebook}.txt` };
        const result = await invoke("read_file", { data })
          .then((response) => {
            if (response?.length > 0) {
              const data = JSON.parse(response);

              return data;
            }
          })
          .catch((error) => {
            console.error("Erro ao carregar arquivo:", error);
            return false;
          });

        return result;
      }
      return false;
    } catch (error) {
      console.error("Erro ao carregar arquivo:", error);
      return false;
    }
  };

  const handleLoadPdf = async (event) => {
    if (event.target.files[0]) {
      const fileRaw = event.target.files[0];

      const reader = new FileReader();

      reader.onload = async (e) => {
        const typedArray = new Uint8Array(e.target.result);
        const loadingTask = pdfjs.getDocument(typedArray);
        try {
          const getPdf = await loadingTask.promise;
          let result = false;

          setPdf(getPdf);

          if (fileRaw?.name) {
            result = await loadLastReading(fileRaw.name);
          }

          if (result) {
            setNumPages(getPdf.numPages);
            setCurrentPage(result.currentPage);
            const wordFirstPag = await getCurrentPageText(
              getPdf,
              result.currentPage
            );

            setPalavras(splitText(wordFirstPag));
          } else {
            setNumPages(getPdf.numPages);
            setCurrentPage(1);

            const wordFirstPag = await getCurrentPageText(getPdf, 1);

            setPalavras(splitText(wordFirstPag));
          }
        } catch (error) {
          console.error("Error during PDF extraction:", error);
        }
      };

      reader.readAsArrayBuffer(fileRaw);
      setFile(fileRaw);
    }
  };

  const handleStartReading = () => {
    setExecutando(true);
  };

  const handleStopReading = () => {
    setExecutando(false);
    if (file?.name) {
      const titlebook = file?.name
        .trim()
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9]/g, "");

      const data = {
        save: `${titlebook}.txt`,
        title: file?.name.replace(/\.[^/.]+$/, ""),
        currentPage,
        indicePalavra,
        timestamp: new Date().toISOString(),
      };

      invoke("save_file", { data }).then((response) => {
        console.log("save_file", response);
      });
    }
  };

  const handleNextPage = () => {
    if (currentPage === 0 && numPages === 0) {
      return;
    }
    if (currentPage < numPages) {
      setCurrentPage((prevPage) => prevPage + 1);
      getCurrentPageText(pdf, currentPage + 1).then((text) => {
        setPalavras(splitText(text));
      });
      setIndicePalavra(0);
    }
    if (currentPage === numPages) {
      setCurrentPage(1);
      getCurrentPageText(pdf, currentPage + 1).then((text) => {
        setPalavras(splitText(text));
      });
      setIndicePalavra(0);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage === 0 && numPages === 0) {
      return;
    }
    if (currentPage >= 1) {
      setCurrentPage((prevPage) => prevPage - 1);
      getCurrentPageText(pdf, currentPage - 1).then((text) => {
        setPalavras(splitText(text));
      });
      setIndicePalavra(0);
    }

    if (currentPage === 1) {
      setCurrentPage(numPages);
      getCurrentPageText(pdf, numPages).then((text) => {
        setPalavras(splitText(text));
      });
      setIndicePalavra(0);
    }
  };

  const handleRestartReading = () => {
    setCurrentPage(1);
    getCurrentPageText(pdf, 1).then((text) => {
      setPalavras(splitText(text));
    });
    setIndicePalavra(0);
  };

  const handleRightClick = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (executando) {
      // se nao tem um pdf carregado, executa somente o texto padrão
      if (!pdf) {
        intervalRef.current = setInterval(() => {
          setIndicePalavra((prevIndice) => {
            if (prevIndice + 1 === palavras.length) {
              return prevIndice;
            }
            if (prevIndice + 1 < palavras.length) {
              return prevIndice + 1;
            } else {
              clearInterval(intervalRef.current); // Parar quando chegar na última palavra
              setExecutando(false); // Desativar execução
              return prevIndice; // Manter a última palavra na tela
            }
          });
        }, velocidade);
        return () => clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setIndicePalavra((prevIndice) => {
          if (prevIndice + 1 === palavras.length) {
            setGoNextPage(true);
            return prevIndice;
          }
          if (prevIndice + 1 < palavras.length) {
            return prevIndice + 1;
          } else {
            clearInterval(intervalRef.current); // Parar quando chegar na última palavra
            setExecutando(false); // Desativar execução
            return prevIndice; // Manter a última palavra na tela
          }
        });
      }, velocidade);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [executando]);

  useEffect(() => {
    if (goNextPage) {
      getCurrentPageText(pdf, currentPage + 1).then((text) => {
        setPalavras(splitText(text));
      });
      setCurrentPage((prevPage) => prevPage + 1);
      setIndicePalavra(0);
      setGoNextPage(false);
      setExecutando(true);
    }
  }, [goNextPage]);

  //useEffect(() => {
  //  if (loadFile) {
  //    setCurrentPage(loadFile.currentPage);
  //    setIndicePalavra(loadFile.indicePalavra);
  //    getCurrentPageText(pdf, loadFile.currentPage).then((text) => {
  //      setPalavras(splitText(text));
  //    });
  //  }
  //}, [loadFile]);

  return (
    <>
      <div
        className="flex flex-col h-full items-center justify-center bg-zinc-900/50 border-l-white/20"
        onContextMenu={handleRightClick}
      >
        <div className="text-center text-4xl text-blue-900">
          <span>Ф</span>
        </div>
        <span className="text-4xl truncate max-w-lg">
          {palavras && palavras.length > 0 && palavras[indicePalavra] ? (
            palavras[indicePalavra]
          ) : (
            <span>&nbsp;</span>
          )}
        </span>

        <div className="flex gap-x-4">
          <button
            className={`${
              executando
                ? "mt-4 p-2 text-xl text-white bg-gray-600 rounded w-20"
                : "mt-4 p-2 text-xl text-white bg-blue-900 rounded w-20"
            }`}
            onClick={handlePreviousPage}
            disabled={executando && !pdf}
          >
            {"<<"}
          </button>
          <button
            className={`${
              executando
                ? "mt-4 p-2 text-xl text-white bg-gray-600 rounded w-32"
                : "mt-4 p-2 text-xl text-white bg-blue-900 rounded w-32"
            }`}
            onClick={handleStartReading}
            disabled={executando}
          >
            Iniciar
          </button>
          <select
            className={`${
              executando
                ? "mt-4 p-2 text-xl bg-gray-600 text-white rounded w-22"
                : "mt-4 p-2 text-xl bg-blue-900 text-white rounded w-22"
            }`}
            onChange={(e) => setVelocidade(Number(e.target.value))}
            value={velocidade}
            disabled={executando}
          >
            <option value="200">200</option>
            <option value="170">250</option>
            <option value="160">300</option>
            <option value="150">350</option>
            <option value="100">400</option>
          </select>
          <button
            className="mt-4 p-2 text-xl text-white bg-red-800 rounded w-32"
            onClick={handleStopReading}
            disabled={!executando && !pdf}
          >
            Parar
          </button>
          <button
            className={`${
              executando
                ? "mt-4 p-2 text-xl text-white bg-gray-600 rounded w-20"
                : "mt-4 p-2 text-xl text-white bg-blue-900 rounded w-20"
            }`}
            onClick={handleNextPage}
            disabled={executando}
          >
            {">>"}
          </button>
        </div>
        <div className="mt-4">
          <input
            accept="application/pdf"
            type="file"
            id="fileInput"
            className="hidden"
            onChange={handleLoadPdf}
            disabled={executando}
          />
          <label
            htmlFor="fileInput"
            className="p-2 text-xl text-white bg-black-500 rounded cursor-pointer inline-block"
          >
            Carregar PDF
          </label>
        </div>

        {numPages > 0 && (
          <>
            <div className="flex gap-x-2">
              <span className="">Total de páginas: {numPages}</span>
              <span className="">Página atual: {currentPage}</span>
            </div>

            <div className="flex gap-x-2">
              <span className="truncate max-w-lg">{file?.name}</span>
            </div>

            <div className="flex gap-x-2 mt-4">
              <span className="truncate max-w-lg">
                <button
                  className="p-2 rounded w-32 underline"
                  onClick={handleRestartReading}
                  disabled={executando}
                >
                  Recomeçar
                </button>
              </span>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;
