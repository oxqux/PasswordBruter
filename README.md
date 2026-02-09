# PasswordBruter

A simple React-based password recovery tool that runs directly in the browser.

### Target MD5 Hash  
Input field to specify the hash you want to recover.

### Search Parameters  
**Min Length / Max Length** — controls the range of password lengths to brute-force.  
**Character Sets:**  
- Numbers  
- Lowercase  
- Uppercase  
- Special Characters  

**Batch Size** — higher values increase speed but also increase memory usage.  

**Smart Patterns / Dictionary Attack** — optional modes to improve efficiency.  

**Start Recovery** — begins the cracking process.

## Usage

1. Open the website: **https://oxqux.github.io/PasswordBruter**  
   **OR** download the `bundle.html` file from the latest **Releases** tab and open it in any browser.
2. Configure the hash and parameters.
3. Start the recovery process and wait for completion.

## Build Instructions

1. Install npm: https://nodejs.org  
2. Clone the repository:
   ```bash
   git clone https://github.com/oxqux/PasswordBruter.git
   cd PasswordBruter
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the project:
   ```bash
   npm run build
   ```
5. The output files will be located in the `dist/` directory.
