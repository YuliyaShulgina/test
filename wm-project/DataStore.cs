using System.Collections.Generic;

namespace Handbook
{
    // Сховище даних — замініть Title/Text/шляхи на реальні
    public static class DataStore
    {
        public static List<SectionData> Sections = new List<SectionData>();

        static DataStore()
        {
            string root = @"\Storage Card\Handbook\";

            for (int i = 1; i <= 48; i++)
            {
                Sections.Add(new SectionData(
                    index:     i,
                    title:     "Розділ " + i,
                    text:      GetSampleText(i),
                    imagePath: root + "images\\section" + i + ".jpg",
                    audioPath: root + "audio\\section" + i + ".wav"
                ));
            }
        }

        private static string GetSampleText(int i)
        {
            // Замініть цей метод на реальний текст кожного розділу.
            // Довжина до 5000 символів на розділ.
            return string.Format(
                "Розділ {0}\r\n\r\n" +
                "Тут розміщено основний текст розділу. " +
                "Замініть цей вміст на реальний текст довідника. " +
                "Максимальна довжина — 5000 символів.\r\n\r\n" +
                "Параграф 1: Lorem ipsum dolor sit amet...\r\n\r\n" +
                "Параграф 2: Consectetur adipiscing elit...\r\n\r\n" +
                "Параграф 3: Sed do eiusmod tempor incididunt...",
                i);
        }
    }
}
