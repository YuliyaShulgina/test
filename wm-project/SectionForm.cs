using System;
using System.Drawing;
using System.IO;
using System.Windows.Forms;

namespace Handbook
{
    public class SectionForm : Form
    {
        private SectionData _data;

        private TabControl  tabControl;
        private TabPage     tabText;
        private TabPage     tabImage;
        private TabPage     tabAudio;

        private TextBox     txtContent;
        private PictureBox  picImage;
        private Label       lblNoImage;
        private Button      btnPlay;
        private Button      btnStop;
        private Label       lblAudioStatus;
        private Label       lblAudioFile;

        public SectionForm(SectionData data)
        {
            _data = data;
            InitializeComponent();
            LoadData();
        }

        private void InitializeComponent()
        {
            this.Text            = _data.ToString();
            this.Size            = new Size(240, 320);
            this.FormBorderStyle = FormBorderStyle.FixedSingle;
            this.MinimizeBox     = false;

            // ── TAB CONTROL ──────────────────────────────
            tabControl      = new TabControl();
            tabControl.Dock = DockStyle.Fill;

            tabText  = new TabPage("Текст");
            tabImage = new TabPage("Фото");
            tabAudio = new TabPage("Аудіо");

            tabControl.TabPages.Add(tabText);
            tabControl.TabPages.Add(tabImage);
            tabControl.TabPages.Add(tabAudio);

            // ── TEXT TAB ──────────────────────────────────
            txtContent           = new TextBox();
            txtContent.Multiline = true;
            txtContent.ReadOnly  = true;
            txtContent.ScrollBars= ScrollBars.Vertical;
            txtContent.Dock      = DockStyle.Fill;
            txtContent.Font      = new Font("Tahoma", 9, FontStyle.Regular);
            txtContent.WordWrap  = true;
            tabText.Controls.Add(txtContent);

            // ── IMAGE TAB ─────────────────────────────────
            picImage           = new PictureBox();
            picImage.Dock      = DockStyle.Fill;
            picImage.SizeMode  = PictureBoxSizeMode.Zoom;
            tabImage.Controls.Add(picImage);

            lblNoImage           = new Label();
            lblNoImage.Text      = "Зображення відсутнє";
            lblNoImage.TextAlign = ContentAlignment.MiddleCenter;
            lblNoImage.Dock      = DockStyle.Fill;
            lblNoImage.Visible   = false;
            tabImage.Controls.Add(lblNoImage);

            // ── AUDIO TAB ─────────────────────────────────
            Panel audioPanel  = new Panel();
            audioPanel.Dock   = DockStyle.Fill;

            lblAudioFile        = new Label();
            lblAudioFile.Text   = "";
            lblAudioFile.Font   = new Font("Tahoma", 8, FontStyle.Regular);
            lblAudioFile.Bounds = new Rectangle(8, 10, 220, 30);

            btnPlay        = new Button();
            btnPlay.Text   = "▶  Відтворити";
            btnPlay.Bounds = new Rectangle(8, 50, 100, 36);
            btnPlay.Click += new EventHandler(btnPlay_Click);

            btnStop        = new Button();
            btnStop.Text   = "■  Зупинити";
            btnStop.Bounds = new Rectangle(118, 50, 100, 36);
            btnStop.Click += new EventHandler(btnStop_Click);

            lblAudioStatus        = new Label();
            lblAudioStatus.Text   = "Готово";
            lblAudioStatus.Font   = new Font("Tahoma", 8, FontStyle.Italic);
            lblAudioStatus.Bounds = new Rectangle(8, 96, 220, 20);

            audioPanel.Controls.Add(lblAudioFile);
            audioPanel.Controls.Add(btnPlay);
            audioPanel.Controls.Add(btnStop);
            audioPanel.Controls.Add(lblAudioStatus);
            tabAudio.Controls.Add(audioPanel);

            this.Controls.Add(tabControl);
        }

        private void LoadData()
        {
            // Текст
            txtContent.Text = _data.Text;

            // Зображення
            if (!string.IsNullOrEmpty(_data.ImagePath) && File.Exists(_data.ImagePath))
            {
                try
                {
                    picImage.Image   = new Bitmap(_data.ImagePath);
                    picImage.Visible = true;
                    lblNoImage.Visible = false;
                }
                catch
                {
                    picImage.Visible   = false;
                    lblNoImage.Visible = true;
                }
            }
            else
            {
                picImage.Visible   = false;
                lblNoImage.Visible = true;
            }

            // Аудіо
            string audioName = string.IsNullOrEmpty(_data.AudioPath)
                ? "—"
                : Path.GetFileName(_data.AudioPath);
            lblAudioFile.Text = "Файл: " + audioName;

            bool audioExists = !string.IsNullOrEmpty(_data.AudioPath)
                               && File.Exists(_data.AudioPath);
            btnPlay.Enabled  = audioExists;
            btnStop.Enabled  = audioExists;

            if (!audioExists)
                lblAudioStatus.Text = "Аудіофайл не знайдено";
        }

        private void btnPlay_Click(object sender, EventArgs e)
        {
            try
            {
                AudioPlayer.Play(_data.AudioPath);
                lblAudioStatus.Text = "Відтворення...";
            }
            catch (Exception ex)
            {
                lblAudioStatus.Text = "Помилка: " + ex.Message;
            }
        }

        private void btnStop_Click(object sender, EventArgs e)
        {
            AudioPlayer.Stop();
            lblAudioStatus.Text = "Зупинено";
        }

        protected override void OnClosed(EventArgs e)
        {
            AudioPlayer.Stop();
            if (picImage.Image != null)
            {
                picImage.Image.Dispose();
                picImage.Image = null;
            }
            base.OnClosed(e);
        }
    }
}
