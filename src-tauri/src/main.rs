// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[tauri::command]
fn save_file(data: serde_json::Value) -> Result<String, String> {
    // Extrair o nome do arquivo dos dados recebidos
    let filename = match data.get("save").and_then(|v| v.as_str()) {
        Some(f) => f,
        None => return Err("Nome do arquivo não fornecido ou inválido".to_string()),
    };

    // Verificar se o arquivo já existe e removê-lo se existir
    let path = std::path::Path::new(filename);
    if path.exists() {
        match std::fs::remove_file(path) {
            Ok(_) => println!("Arquivo existente deletado com sucesso"),
            Err(e) => return Err(format!("Erro ao deletar o arquivo existente: {}", e)),
        }
    }

    // Tenta salvar os dados no novo arquivo
    match std::fs::write(path, data.to_string()) {
        Ok(_) => Ok("Arquivo salvo com sucesso".to_string()),
        Err(e) => Err(format!("Erro ao salvar o arquivo: {}", e)),
    }
}

#[tauri::command]
fn read_file(data: serde_json::Value) -> Option<String> {
    // Tentar extrair o nome do arquivo de forma segura
    let filename = match data.get("read").and_then(|r| r.as_str()) {
        Some(f) => f,
        None => {
            println!("Nome do arquivo não fornecido.");
            return None;
        }
    };
    println!("Lendo arquivo: {}", filename);
    // Tentar ler o arquivo e retornar o conteúdo se possível, caso contrário retorna None
    match std::fs::read_to_string(filename) {
        Ok(content) => Some(content),
        Err(e) => {
            println!("Erro ao ler o arquivo: {}", e);
            None
        }
    }
}

#[tauri::command]
fn clear_file(filename: String) -> Result<String, String> {
    match std::fs::remove_file(&filename) {
        Ok(_) => Ok("Arquivo deletado com sucesso".to_string()),
        Err(e) => Err(format!("Erro ao deletar o arquivo: {}", e)),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_file, read_file, clear_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
