import type { ActivityRow } from '../services/nutritionStatsCalculator';

/**
 * Render the RP calorie reference: one row per activity level, with
 * maintenance, cutting, and bulking targets.
 *
 * @param props
 */
const CalorieTargetsTable = ({ rows }: { rows: ActivityRow[] }) => (
  <figure>
    <table>
      <thead>
        <tr>
          <th>Activity</th>
          <th data-num>Maintenance</th>
          <th data-num>Cutting</th>
          <th data-num>Bulking</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.activityLevel}>
            <td>{row.activityLevel}</td>
            <td data-num>{row.maintenance}</td>
            <td data-num>{row.cut}</td>
            <td data-num>{row.bulk}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </figure>
);

export default CalorieTargetsTable;
