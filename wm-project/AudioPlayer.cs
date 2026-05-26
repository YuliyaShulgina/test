using System;
using System.Runtime.InteropServices;

namespace Handbook
{
    // Відтворення WAV через Windows CE API
    public static class AudioPlayer
    {
        private const int SND_FILENAME = 0x00020000;
        private const int SND_ASYNC    = 0x0001;
        private const int SND_SYNC     = 0x0000;
        private const int SND_NODEFAULT= 0x0002;
        private const int SND_PURGE    = 0x0040;

        [DllImport("coredll.dll", SetLastError = true)]
        private static extern bool PlaySound(string szSound, IntPtr hMod, int fdwSound);

        public static void Play(string wavPath)
        {
            Stop();
            PlaySound(wavPath, IntPtr.Zero, SND_FILENAME | SND_ASYNC | SND_NODEFAULT);
        }

        public static void Stop()
        {
            PlaySound(null, IntPtr.Zero, SND_PURGE);
        }
    }
}
