using System;

namespace Handbook
{
    public class SectionData
    {
        public int    Index     { get; set; }
        public string Title     { get; set; }
        public string Text      { get; set; }  // до 5000 символів
        public string ImagePath { get; set; }  // шлях до файлу .jpg / .png
        public string AudioPath { get; set; }  // шлях до файлу .wav

        public SectionData(int index, string title, string text,
                           string imagePath, string audioPath)
        {
            Index     = index;
            Title     = title;
            Text      = text;
            ImagePath = imagePath;
            AudioPath = audioPath;
        }

        public override string ToString()
        {
            return string.Format("{0:D2}. {1}", Index, Title);
        }
    }
}
