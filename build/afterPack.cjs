const { execFileSync } = require("child_process");
const path = require("path");

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== "win32") return;

  const projectDir = context.packager.projectDir;
  const rceditPath = path.join(
    projectDir,
    "node_modules",
    "electron-winstaller",
    "vendor",
    "rcedit.exe",
  );
  const iconPath = path.join(projectDir, "build", "icon.ico");
  const exePath = path.join(context.appOutDir, "Cloudgram Drive.exe");

  execFileSync(rceditPath, [
    exePath,
    "--set-icon",
    iconPath,
    "--set-version-string",
    "FileDescription",
    "Cloudgram Drive",
    "--set-version-string",
    "ProductName",
    "Cloudgram Drive",
  ]);
};
