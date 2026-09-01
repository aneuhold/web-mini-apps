import { type AnalysisRow } from '../services/nutritionStatsCalculator';

/**
 * Render the calorie target every (phase × day-type) plan template resolves
 * to at the current bodyweight. The note column calls out rows where the
 * global minimum is holding the target above what the RP arithmetic asked
 * for.
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
          <th data-num>Target</th>
          <th>Note</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.phase}-${row.dayType}`}>
            <td>{row.phase}</td>
            <td>{row.dayType}</td>
            <td>{row.activityLevel}</td>
            <td data-num>{row.calorieTarget}</td>
            <td>
              {row.calorieTarget === row.rawCalorieTarget
                ? ''
                : `floor (RP math: ${row.rawCalorieTarget})`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </figure>
);

export default TemplateAnalysisTable;
