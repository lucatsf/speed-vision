import { useState, useCallback } from 'react';

const useSprayReader = () => {
  const [input, setInput] = useState('');
  const [words, setWords] = useState([]);
  const [wpm, setWpm] = useState(300);
  const [wordIdx, setWordIdx] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timers, setTimers] = useState([]);

  String.prototype.repeat = function( num ){
      return new Array( num + 1 ).join( this );
  }
  
  const preprocessInput = useCallback((input) => {
    if (!input) {
      return;
    }
    const allWords = input.split(/\s+/);
    let tmpWords = [...allWords];
    let t = 0;

    for (var i=0; i<allWords.length; i++){

      if(allWords[i].indexOf('.') != -1){
        tmpWords[t] = allWords[i].replace('.', '•');
      }

      if((allWords[i].indexOf(',') != -1 || allWords[i].indexOf(':') != -1 || allWords[i].indexOf('-') != -1 || allWords[i].indexOf('(') != -1|| allWords[i].length > 8) && allWords[i].indexOf('.') == -1){
        tmpWords.splice(t+1, 0, allWords[i]);
        tmpWords.splice(t+1, 0, allWords[i]);
        t++;
        t++;
      }

      if(allWords[i].indexOf('.') != -1 || allWords[i].indexOf('!') != -1 || allWords[i].indexOf('?') != -1 || allWords[i].indexOf(':') != -1 || allWords[i].indexOf(';') != -1|| allWords[i].indexOf(')') != -1){
        tmpWords.splice(t+1, 0, ".");
        tmpWords.splice(t+1, 0, ".");
        tmpWords.splice(t+1, 0, ".");
        t++;
        t++;
        t++;
      }

      t++;
    }

    setWords(tmpWords);
    setWordIdx(0);
  }, []);

  const pivot = useCallback((word) => {
    let pivotIndex = Math.floor(word.length / 2);

    if (word.length > 5 || word.length % 2 === 0) {
      pivotIndex--;
    }

    return (
      <div className="text-center font-mono text-4xl">
        {word.split('').map((char, index) => {
          let className = index === pivotIndex ? 'text-red-600' : 'text-gray-800';
          return <span key={index} className={className}>{char}</span>;
        })}
      </div>
    );
  }, []);

  const start = useCallback(() => {
    if (!JSON.parse(localStorage.getItem('stopRead'))) {
      setIsRunning(true);
      const interval = setInterval(() => {
        setWordIdx((currentWordIdx) => {
          if (currentWordIdx >= words.length) {
            clearInterval(interval);
            setIsRunning(false);
            return 0;
          } else {
            return currentWordIdx + 1;
          }
        });
      }, 60000 / wpm);
  
      setTimers((prevTimers) => [...prevTimers, interval]);
    }
  }, [wpm, words]);

  const stop = useCallback(() => {
    timers.forEach(clearInterval);
    setTimers([]);
    setIsRunning(false);
    localStorage.setItem('stopRead', true);
  }, [timers]);

  return {
    input,
    setInput: (newInput) => {
      setInput(newInput);
      preprocessInput(newInput);
    },
    wpm,
    setWpm,
    isRunning,
    start,
    stop,
    currentWord: words[wordIdx] ? pivot(words[wordIdx]) : '',
  };
};

export default useSprayReader;
