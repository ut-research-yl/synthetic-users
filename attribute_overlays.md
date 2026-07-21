Display Attribute Overlays:
Attribute visualization with overlays in SAP Signavio Process Manager.

Attribute overlays are attribute visualization layers. With attribute overlays, you can show attributes directly on the diagram. You can use different icons and colors for overlays.

You can add attribute overlays to diagrams and diagram elements.

Attribute visualization layers are available for the following diagram types:

BPMN diagrams

Value chain diagrams

ArchiMate diagrams

Organization charts

Attribute overlays are managed by your workspace administrator. They also set the rules that determine when an attribute overlay is displayed.

Tip
Attribute Visualization overlays are designed for reviewing completed diagrams, not for use during active editing. When you change a property (for example, a task name), the overlay deactivates automatically to ensure data accuracy. To make sure the overlays are displayed, finish your edits first, and then activate the overlay.

Display Attribute Overlays while Modeling
To select an attribute overlay, click  in the toolbar.

It is possible to display several attribute overlays at once.

Display Attribute Overlays in SAP Signavio Process Collaboration Hub
If a diagram contains attribute overlays, the number of available overlays and the number of visible overlay categories are displayed.

Users can show or hide overlays and select which overlays they want to view.

—————

Detailed explanation by extracting the existing code:

---
  Attribute Visualization — Was es ist und wie man es bedient

  Die Grundidee

  Prozessdiagramme in SAP Signavio können Custom Attributes an Shapes haben — zum Beispiel ein Feld "Risk
  Level" mit Werten wie "High", "Medium", "Low". Normally sieht man diese Werte nur, wenn man auf ein Shape
  klickt und das Properties-Panel aufmacht.

  Attribute Visualization löst dieses Problem: Man kann Regeln definieren, die diese Attributwerte direkt
  als farbige Icons auf den Shapes im Diagramm einblenden — ohne dass jemand klicken muss. Ein Shape mit
  "Risk Level = High" könnte dann automatisch ein rotes Ausrufezeichen-Icon bekommen; "Low" bekommt ein
  grünes.

  ---
  Wer kann es nutzen?

  Das Konfigurieren ist nur für Admins zugänglich. Sobald ein Admin Layer angelegt hat, können alle Nutzer
  mit Editor-Zugriff diese Layer im Diagramm-Editor ein- und ausblenden.

  ---
  Als Admin: Konfigurieren

  Der Admin öffnet die Konfiguration über das Menü im Explorer → "Manage attribute visualization". Das
  öffnet einen Tab im Metadata-Management-Dialog.

  Dort arbeitet man mit einem dreistufigen System:

  1. Layer anlegen

  Ein Layer ist das übergeordnete Konzept — man kann sich ihn wie eine "Brille" vorstellen, die man über ein
   Diagramm legt. Jeder Layer hat:

  - Name — z.B. "Risk Level" oder "Process Owner"
  - Aktiv/Inaktiv — ob der Layer überhaupt verfügbar ist
  - Visualization — welches Icon-Set verwendet wird. Die Optionen sind thematisch gruppiert:
    - Finance Icon, Human Icon, Technology Icon, Event Icon
    - Clock, Dashboard, Data Object, Exclamation Mark, Flag, IT System, Message, Notes, Checkbox
  (true/false/undefined)
    - "Property" — zeigt statt eines Icons direkt den Textwert an
  - "Show attribute values" — wenn aktiviert, wird zusätzlich zum Icon noch der Attributwert als Text
  daneben angezeigt (außer bei "Property", wo das keinen Sinn ergibt)

  2. Rule Sets definieren

  Innerhalb eines Layers kann man mehrere Rule Sets anlegen. Jedes Rule Set hat eine Farbe — diese Farbe
  bekommt das Icon, wenn die Regeln des Rule Sets zutreffen. Das System wählt automatisch die Icon-Variante
  (hell oder dunkel), die auf dem Farbhintergrund besser lesbar ist.

  3. Regeln schreiben

  Jedes Rule Set enthält eine oder mehrere Regeln. Jede Regel besteht aus drei Teilen:

  - Property — welches Custom Attribute geprüft wird (z.B. "Risk Level")
  - Relation — wie verglichen wird. Die verfügbaren Operatoren hängen vom Typ des Attributs ab:
    - Text: equals, contains, starts with, ends with, is empty, is not empty
    - Zahl: equals, <, ≤, ≥, >
    - Boolean: is true, is false
    - Auswahlliste: equals, equals not, is empty, is not empty
    - Risiken/Controls: is empty, is not empty, no uncontrolled risks, uncontrolled risks
  - Value — der Vergleichswert, z.B. "High"

  Beispiel-Konfiguration:

  ▎ Layer "Risk Level", Icon: Exclamation Mark
  ▎ - Rule Set 1 → Farbe Rot → Regel: Risk Level equals "High"
  ▎ - Rule Set 2 → Farbe Orange → Regel: Risk Level equals "Medium"
  ▎ - Rule Set 3 → Farbe Grün → Regel: Risk Level equals "Low"

  Die Konfiguration speichert sich automatisch — 5 Sekunden nachdem man aufgehört hat zu tippen.

  ---
  Als Nutzer: Im Editor verwenden

  Wenn ein Admin mindestens einen aktiven Layer angelegt hat, erscheinen im Diagramm-Editor in der Toolbar
  neue Buttons — einen pro Layer.

  1. Man klickt auf den Button des gewünschten Layers (z.B. "Risk Level")
  2. Das System schickt das aktuelle Diagramm ans Backend, das berechnet, welche Shapes welche Regeln
  erfüllen
  3. Auf den passenden Shapes erscheinen farbige Icons als Overlay-Badges
  4. Man klickt erneut auf den Button, um die Overlays wieder auszublenden

  Mehrere Layer können gleichzeitig aktiv sein — die Icons stacken sich dann nebeneinander oder
  untereinander auf dem Shape.

  Die Overlays verschwinden automatisch wenn man speichert, Undo/Redo macht oder die Sprache wechselt.

  ---
  Was man nicht overlayed bekommt

  Nicht alle Shape-Typen bekommen Overlays. Ausgeschlossen sind Verbindungslinien und Diagramm-Container —
  also z.B. BPMN Sequence Flows, Message Flows, Associations und die Diagramm-Hintergrund-Shapes selbst. Nur
   "echte" Inhaltselemente (Tasks, Events, Gateways, etc.) bekommen Icons.