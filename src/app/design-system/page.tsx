import React from "react";
import styles from "./page.module.css";

const palette = [
  { name: "Brand Dark", value: "#0B1220" },
  { name: "Surface Card", value: "#162236" },
  { name: "Vibrant Blue", value: "#0A84FF" },
  { name: "Energetic Orange", value: "#FF7A00" }
];

const iconItems = [
  { label: "My Team", icon: "⚽" },
  { label: "Leagues", icon: "🏆" },
  { label: "Stats", icon: "📊" },
  { label: "Transfers", icon: "🔁" },
  { label: "Fixtures", icon: "📅" },
  { label: "More", icon: "🎒" }
];

export default function DesignSystemPage() {
  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <h1>VPL FANTASY</h1>
        <nav aria-label="Design system sections">
          <a href="#brand">Brand Identity</a>
          <a href="#palette">Color Palette</a>
          <a href="#typography">Typography</a>
          <a href="#buttons">Buttons &amp; UI</a>
          <a href="#cards">Cards &amp; Components</a>
          <a href="#iconography">Iconography</a>
        </nav>
      </aside>

      <section className={styles.content}>
        <header id="brand" className={styles.section}>
          <h2>Brand Identity</h2>
          <p>
            This visual system is built to capture the energy of Finnish football:
            premium sports-broadcast aesthetics with an engaging interactive game feel.
          </p>
          <div className={styles.brandGrid}>
            <article className={styles.panel}>
              <div className={styles.logoMock}>VEIKKAUSLIIGA</div>
              <small>Fantasy League</small>
            </article>
            <article className={styles.panel}>
              <h3>Core Philosophy</h3>
              <ul>
                <li>Performance-first readability for live game moments.</li>
                <li>Clearly high-contrast hierarchy with bold visual rhythm.</li>
                <li>Nordic sport premium feel with bright accents.</li>
              </ul>
            </article>
          </div>
        </header>

        <section id="palette" className={styles.section}>
          <h2>Color Palette</h2>
          <div className={styles.paletteGrid}>
            {palette.map((color) => (
              <article key={color.name} className={styles.colorCard}>
                <div
                  className={styles.swatch}
                  style={{ backgroundColor: color.value }}
                  aria-label={`${color.name} swatch`}
                />
                <strong>{color.name}</strong>
                <code>{color.value}</code>
              </article>
            ))}
          </div>
        </section>

        <section id="typography" className={styles.section}>
          <h2>Typography</h2>
          <article className={styles.panel}>
            <p className={styles.caption}>HEADLINES</p>
            <h3 className={styles.h1}>Heading 1 - 48px</h3>
            <h4 className={styles.h2}>Heading 2 - 30px</h4>
            <p className={styles.bodyLg}>
              Body Large: Build your dream team and compete with fans across Finland.
            </p>
            <p className={styles.bodyMd}>
              Body Medium: Use your 100M budget wisely. Scout before every round.
            </p>
            <p className={styles.bodySm}>
              Body Small: Transfers are confirmed before each weekly deadline.
            </p>
          </article>
        </section>

        <section id="buttons" className={styles.section}>
          <h2>Buttons &amp; UI Elements</h2>
          <div className={styles.buttonGrid}>
            <article className={styles.panel}>
              <h3>Button Variations</h3>
              <div className={styles.buttonRow}>
                <button className={styles.primary}>Primary Button</button>
                <button className={styles.accent}>Action Button</button>
                <button className={styles.ghost}>Ghost Secondary</button>
              </div>
            </article>
            <article className={styles.panel}>
              <h3>Form Elements</h3>
              <label htmlFor="mock-team-name">Fantasy name</label>
              <input id="mock-team-name" placeholder="e.g. FootballNinjas" />
              <label className={styles.checkbox}>
                <input type="checkbox" defaultChecked /> Accept league terms
              </label>
            </article>
          </div>
        </section>

        <section id="cards" className={styles.section}>
          <h2>Cards &amp; Components</h2>
          <div className={styles.cardGrid}>
            <article className={styles.playerCard}>
              <p className={styles.caption}>PLAYER CARD</p>
              <div className={styles.avatar} />
              <strong>R. Rudakovic</strong>
              <div className={styles.meta}>
                <span>14.2</span>
                <span>€7.6m</span>
              </div>
            </article>
            <article className={styles.tableCard}>
              <h3>Global League Top 5</h3>
              <table>
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Manager</th>
                    <th>GW</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Erkki King7</td>
                    <td>63</td>
                    <td>1,640</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Vepsu United</td>
                    <td>71</td>
                    <td>1,635</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>Tampereen Press</td>
                    <td>65</td>
                    <td>1,628</td>
                  </tr>
                </tbody>
              </table>
            </article>
          </div>
        </section>

        <section id="iconography" className={styles.section}>
          <h2>Iconography</h2>
          <div className={styles.iconGrid}>
            {iconItems.map((item) => (
              <article key={item.label} className={styles.iconCard}>
                <span aria-hidden>{item.icon}</span>
                <small>{item.label}</small>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
