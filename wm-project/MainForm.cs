using System;
using System.Drawing;
using System.Windows.Forms;

namespace Handbook
{
    public class MainForm : Form
    {
        private ListView listView;
        private Label    lblTitle;

        public MainForm()
        {
            InitializeComponent();
            PopulateList();
        }

        private void InitializeComponent()
        {
            this.Text            = "Довідник";
            this.Size            = new Size(240, 320);
            this.FormBorderStyle = FormBorderStyle.FixedSingle;
            this.MinimizeBox     = false;

            lblTitle             = new Label();
            lblTitle.Text        = "Довідник — 48 розділів";
            lblTitle.Font        = new Font("Tahoma", 9, FontStyle.Bold);
            lblTitle.Bounds      = new Rectangle(0, 0, 240, 24);
            lblTitle.TextAlign   = ContentAlignment.MiddleCenter;

            listView             = new ListView();
            listView.Bounds      = new Rectangle(0, 24, 240, 270);
            listView.View        = View.List;
            listView.FullRowSelect = true;
            listView.Font        = new Font("Tahoma", 9, FontStyle.Regular);
            listView.ItemActivate += new EventHandler(listView_ItemActivate);

            this.Controls.Add(lblTitle);
            this.Controls.Add(listView);
        }

        private void PopulateList()
        {
            foreach (SectionData s in DataStore.Sections)
                listView.Items.Add(new ListViewItem(s.ToString()) { Tag = s });
        }

        private void listView_ItemActivate(object sender, EventArgs e)
        {
            if (listView.SelectedItems.Count == 0) return;
            SectionData data = (SectionData)listView.SelectedItems[0].Tag;
            SectionForm form = new SectionForm(data);
            form.ShowDialog();
        }
    }
}
