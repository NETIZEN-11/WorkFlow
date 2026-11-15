# Create simple placeholder images using PowerShell
Add-Type -AssemblyName System.Drawing

# Create 1024x1024 icon
$icon = New-Object System.Drawing.Bitmap(1024, 1024)
$graphics = [System.Drawing.Graphics]::FromImage($icon)
$graphics.Clear([System.Drawing.Color]::FromArgb(0, 122, 255))
$font = New-Object System.Drawing.Font("Arial", 200, [System.Drawing.FontStyle]::Bold)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$graphics.DrawString("DF", $font, $brush, 350, 400)
$icon.Save("$PSScriptRoot\assets\icon.png")
$icon.Save("$PSScriptRoot\assets\adaptive-icon.png")
$graphics.Dispose()
$icon.Dispose()

# Create 2048x2048 splash
$splash = New-Object System.Drawing.Bitmap(2048, 2048)
$graphics2 = [System.Drawing.Graphics]::FromImage($splash)
$graphics2.Clear([System.Drawing.Color]::White)
$font2 = New-Object System.Drawing.Font("Arial", 300, [System.Drawing.FontStyle]::Bold)
$brush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 122, 255))
$graphics2.DrawString("DailyFlow", $font2, $brush2, 300, 850)
$splash.Save("$PSScriptRoot\assets\splash.png")
$graphics2.Dispose()
$splash.Dispose()

# Create 48x48 favicon
$favicon = New-Object System.Drawing.Bitmap(48, 48)
$graphics3 = [System.Drawing.Graphics]::FromImage($favicon)
$graphics3.Clear([System.Drawing.Color]::FromArgb(0, 122, 255))
$font3 = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Bold)
$graphics3.DrawString("DF", $font3, $brush, 5, 10)
$favicon.Save("$PSScriptRoot\assets\favicon.png")
$favicon.Save("$PSScriptRoot\assets\notification-icon.png")
$graphics3.Dispose()
$favicon.Dispose()

Write-Host "✅ Assets created successfully!" -ForegroundColor Green
