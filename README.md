# Speed Vision

![2024-04-25-20-21-45](https://github.com/lucatsf/speed-vision/assets/18267941/5f73a9b8-1704-4ff2-9022-0a98c5e05899)

Speed Vision é um aplicativo de leitura rápida que ajuda os usuários a aumentarem sua velocidade de leitura e compreensão através de uma interface intuitiva e simplificada. Desenvolvido com React, TailwindCSS, Speed Vision é uma aplicação desktop.

## Características

- **Multiplataforma**: Disponível para Windows, macOS e Linux.

## Início Rápido

Para iniciar com o Speed Vision, siga os passos abaixo:

1. Clone o repositório:
   ```bash
   git clone git@github.com:lucatsf/speed-vision.git

2. Instale dependencias no sistema (para linux):
```bash
sudo apt-get install libsoup2.4-dev
&& sudo apt-get install libatk1.0-dev
&& sudo apt-get install libcairo2-dev
&& sudo apt-get install libgdk-pixbuf2.0-dev
&& sudo apt-get install libgtk-3-dev
&& sudo apt-get install libjavascriptcoregtk-4.0-dev
&& sudo apt-get install libwebkit2gtk-4.0-dev
```

3. Instale as dependências usando o node 20:
    ```bash
    cd speed-vision
    npm install

4. Execute o aplicativo:
    ``` bash
    npm run tauri dev

## Construção do Aplicativo

Para construir uma versão de produção do Speed Vision, execute:
```bash
    npm run tauri build
```
Os artefatos de construção serão encontrados no diretório src-tauri/target/release.
