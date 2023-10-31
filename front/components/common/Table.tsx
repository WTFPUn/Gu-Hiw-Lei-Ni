type TableRowProps = {
  children?: React.ReactNode;
  name: string;
};

type TableProps = {
  children?: React.ReactNode;
  header?: React.ReactNode;
};

/**
 * Renders a row item for a table.
 * @param {string} name - The name of the row item.
 * @param {React.ReactNode} children - The content of the row item.
 */
export function RowItem(props: TableRowProps) {
  return (
    <tr>
      <td className="font-medium py-1.5 pr-2">{props.name}</td>
      <td>{props.children}</td>
    </tr>
  );
}

/**
 * A reusable table component that renders a table with header and body.
 * @param {React.ReactNode} children - The body of the table.
 * @param {React.ReactNode} header - The header of the table.
 */
export function Table(props: TableProps) {
  return (
    <table className="text-black font-normal">
      {props.header && <thead>{props.header}</thead>}
      <tbody>{props.children}</tbody>
    </table>
  );
}
