using System;
using System.Collections.Generic;
using System.Drawing;
using System.Windows.Forms;

namespace MemoryGame
{
    public partial class Form1 : Form
    {
        private Image[] images = null!;
        private Image backImage = null!;
        private List<Carte> cards = null!;
        private Panel? boardPanel;
        private PictureBox? firstPB;
        private PictureBox? secondPB;

        private System.Windows.Forms.Timer hideTimer;
        private System.Windows.Forms.Timer gameTimer;

        private int attempts;
        private DateTime startTime;
        private int gridSize = 4;
        private int hideInterval = 1000;
        private bool isProcessing;
        private int matchesFound;

        public Form1()
        {
            InitializeComponent();

            hideTimer = new System.Windows.Forms.Timer();
            hideTimer.Interval = hideInterval;
            hideTimer.Tick += HideTimer_Tick;

            gameTimer = new System.Windows.Forms.Timer();
            gameTimer.Interval = 500;
            gameTimer.Tick += GameTimer_Tick;

            // UI tweaks
            Text = "🧠 Memory Game";
            btnJouer.BackColor = Color.LightGreen;
            btnRejouer.BackColor = Color.LightBlue;
        }

        private void btnJouer_Click(object sender, EventArgs e)
        {
            StartNewGame();
        }

        private void btnOptions_Click(object sender, EventArgs e)
        {
            var diff = MessageBox.Show(
                "Facile = Oui (4x4)\nMoyen = Non (6x6)\nDifficile = Annuler (8x8)",
                "Choisir difficulté",
                MessageBoxButtons.YesNoCancel,
                MessageBoxIcon.Question);

            if (diff == DialogResult.Yes)
                gridSize = 4;
            else if (diff == DialogResult.No)
                gridSize = 6;
            else
                gridSize = 8;

            var speed = MessageBox.Show(
                "Vitesse normale = Oui (1s)\nRapide = Non (0.5s)",
                "Choisir vitesse",
                MessageBoxButtons.YesNo);

            hideInterval = (speed == DialogResult.Yes) ? 1000 : 500;

            MessageBox.Show($"Grille : {gridSize}x{gridSize}\nVitesse : {(hideInterval == 1000 ? "Normale" : "Rapide")}");
        }

        private void btnQuitter_Click(object sender, EventArgs e)
        {
            Close();
        }

        private void btnRejouer_Click(object sender, EventArgs e)
        {
            StartNewGame();
        }

        private void PrepareImages()
        {
            // Prepare face images based on current grid size (number of pairs)
            int totalPairs = (gridSize * gridSize) / 2;
            images = new Image[totalPairs];

            // Cybersecurity themed labels to draw on the cards
            // Provide enough unique labels for large grids (e.g. 8x8 => 32 pairs)
            string[] cyberLabels = new string[]
            {
                "Virus", "Lock", "Key", "Shield", "Hacker", "Firewall", "Phish", "Malware",
                "Trojan", "VPN", "Proxy", "Botnet", "Rootkit", "Spam", "Exploit", "Patch",
                "Cipher", "Token", "Password", "Breach", "Antivirus", "Backup", "ZeroDay", "DDoS",
                "Spyware", "Ransomware", "Hash", "Cloud", "Router", "Socket", "Packet", "Kernel"
            };

            Color[] palette = new Color[]
            {
                Color.DarkCyan, Color.DarkOrange, Color.DarkMagenta, Color.DarkGreen,
                Color.CadetBlue, Color.IndianRed, Color.SteelBlue, Color.MediumPurple
            };

            for (int i = 0; i < totalPairs; i++)
            {
                Bitmap bmp = new Bitmap(100, 100);
                using (Graphics g = Graphics.FromImage(bmp))
                {
                    // choose color from palette
                    Color bg = palette[i % palette.Length];
                    g.Clear(bg);

                    using Font f = new Font("Arial", 14, FontStyle.Bold);
                    using Brush br = new SolidBrush(Color.White);

                    // Use a unique label per pair. If we somehow need more labels than provided,
                    // fall back to a generated label to guarantee uniqueness.
                    string label = (i < cyberLabels.Length) ? cyberLabels[i] : $"Item{i}";
                    SizeF sz = g.MeasureString(label, f);
                    g.DrawString(label, f, br, (bmp.Width - sz.Width) / 2, (bmp.Height - sz.Height) / 2);
                }
                images[i] = bmp;
            }

            // back image (common for all cards)
            Bitmap back = new Bitmap(100, 100);
            using (Graphics g = Graphics.FromImage(back))
            {
                g.Clear(Color.DimGray);
                using Font f = new Font("Arial", 24, FontStyle.Bold);
                using Brush br = new SolidBrush(Color.White);
                string s = "?";
                SizeF sz = g.MeasureString(s, f);
                g.DrawString(s, f, br, (back.Width - sz.Width) / 2, (back.Height - sz.Height) / 2);
            }
            backImage = back;
        }

        private void StartNewGame()
        {
            hideTimer.Stop();
            gameTimer.Stop();

            PrepareImages();

            if (boardPanel != null)
            {
                Controls.Remove(boardPanel);
                boardPanel.Dispose();
            }

            firstPB = null;
            secondPB = null;
            isProcessing = false;
            matchesFound = 0;
            attempts = 0;

            lblAttempts.Text = "Essais : 0";
            lblTime.Text = "Temps : 00:00";

            startTime = DateTime.Now;
            gameTimer.Start();

            boardPanel = new Panel();
            int cardSize = 80;
            int spacing = 10;
            int cols = gridSize;
            int rows = gridSize;

            boardPanel.Size = new Size(cols * cardSize + (cols - 1) * spacing, rows * cardSize + (rows - 1) * spacing);
            // center panel
            boardPanel.Location = new Point((ClientSize.Width - boardPanel.Width) / 2, 60);
            Controls.Add(boardPanel);

            int total = cols * rows;
            int pairs = total / 2;

            List<int> indices = new List<int>();
            for (int i = 0; i < pairs; i++)
            {
                indices.Add(i);
                indices.Add(i);
            }

            Shuffle(indices);

            cards = new List<Carte>();

            for (int i = 0; i < total; i++)
            {
                PictureBox pb = new PictureBox();
                pb.Size = new Size(cardSize, cardSize);
                pb.Location = new Point(
                    (i % cols) * (cardSize + spacing),
                    (i / cols) * (cardSize + spacing));

                pb.SizeMode = PictureBoxSizeMode.StretchImage;
                pb.Image = backImage;
                pb.Tag = i;
                pb.BorderStyle = BorderStyle.FixedSingle;
                pb.Click += Card_Click;

                int imageIdx = indices[i];
                // each pair id maps directly to the prepared image for that id
                cards.Add(new Carte(imageIdx, images[imageIdx]));

                boardPanel.Controls.Add(pb);
            }
        }

        private void Card_Click(object? sender, EventArgs e)
        {
            if (cards == null || cards.Count == 0)
            {
                MessageBox.Show("Erreur : jeu non initialisé");
                return;
            }

            if (isProcessing) return;

            if (sender is not PictureBox pb) return;
            if (pb.Tag == null) return;

            int idx = (int)pb.Tag;
            if (idx < 0 || idx >= cards.Count) return;

            Carte carte = cards[idx];

            if (carte.Etat != EtatCarte.Cachee) return;

            pb.Image = carte.Face;
            carte.Etat = EtatCarte.Revelee;

            if (firstPB == null)
            {
                firstPB = pb;
                return;
            }

            // prevent selecting the same card twice
            if (firstPB == pb) return;

            secondPB = pb;

            attempts++;
            lblAttempts.Text = $"Essais : {attempts}";

            int idx1 = (int)firstPB.Tag;
            int idx2 = (int)secondPB.Tag;

            if (cards[idx1].Id == cards[idx2].Id)
            {
                cards[idx1].Etat = EtatCarte.Trouvee;
                cards[idx2].Etat = EtatCarte.Trouvee;

                matchesFound += 2;

                // disable the pictureboxes so they cannot be clicked or hidden later
                if (firstPB != null) firstPB.Enabled = false;
                if (secondPB != null) secondPB.Enabled = false;

                firstPB = null;
                secondPB = null;

                if (matchesFound == gridSize * gridSize)
                {
                    gameTimer.Stop();
                    TimeSpan total = DateTime.Now - startTime;
                    System.Media.SystemSounds.Beep.Play();
                    MessageBox.Show($@"Bravo ! Temps : {total:mm\:ss}  Essais : {attempts}");
                }
            }
            else
            {
                isProcessing = true;
                hideTimer.Interval = hideInterval;
                hideTimer.Start();
            }
        }

        private void HideTimer_Tick(object? sender, EventArgs e)
        {
            hideTimer.Stop();

            // Only hide cards that are still revealed (not marked Trouvee)
            if (firstPB != null && firstPB.Tag != null)
            {
                int i = (int)firstPB.Tag;
                if (cards[i].Etat == EtatCarte.Revelee)
                {
                    firstPB.Image = backImage;
                    cards[i].Etat = EtatCarte.Cachee;
                }
            }

            if (secondPB != null && secondPB.Tag != null)
            {
                int i = (int)secondPB.Tag;
                if (cards[i].Etat == EtatCarte.Revelee)
                {
                    secondPB.Image = backImage;
                    cards[i].Etat = EtatCarte.Cachee;
                }
            }

            firstPB = null;
            secondPB = null;
            isProcessing = false;
        }

        private void GameTimer_Tick(object? sender, EventArgs e)
        {
            TimeSpan t = DateTime.Now - startTime;
            lblTime.Text = $@"Temps : {t:mm\:ss}";
        }

        private void Shuffle<T>(IList<T> list)
        {
            Random rng = new Random();
            int n = list.Count;

            while (n > 1)
            {
                n--;
                int k = rng.Next(n + 1);
                (list[k], list[n]) = (list[n], list[k]);
            }
        }
    }
}