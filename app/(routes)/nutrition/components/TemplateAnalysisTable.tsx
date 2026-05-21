import nutritionStatsCalculator, { type AnalysisRow } from '../services/nutritionStatsCalculator';

/**
 * Render the configured-vs-recommended analysis for every existing
 * (phase × day-type) plan template. Δ uses `recommended − configured`:
 * positive = add calories to align, negative = cut calories to align.
 *
 * @param props
 */
const TemplateAnalysisTable = ({ rows }: { rows: AnalysisRow[] }) => (
  <figure>
    <table>
      <thead>
        <tr>
          <th>Phase</th>
          <th>Day type</th>
          <th>Activity</th>
          <th data-num>Configured</th>
          <th data-num>Recommended</th>
          <th data-num>Δ</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const diff = row.recommended - row.configured;
          return (
            <tr key={`${row.phase}-${row.dayType}`}>
              <td>{row.phase}</td>
              <td>{row.dayType}</td>
              <td>{row.activityLevel}</td>
              <td data-num>{row.configured}</td>
              <td data-num>{row.recommended}</td>
              <td data-num>{nutritionStatsCalculator.formatSigned(diff, 0)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </figure>
);

export default TemplateAnalysisTable;
