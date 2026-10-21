while ($true) {
    ssh -N -o ServerAliveInterval=10 -o ServerAliveCountMax=3 -o StrictHostKeyChecking=no -L 5432:192.168.80.2:5432 root@72.62.141.188
    Start-Sleep -Seconds 2
}
