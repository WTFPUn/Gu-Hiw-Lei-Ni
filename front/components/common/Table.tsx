type TableRowProps = {
  children?: React.ReactNode;
  name: string;
  'data-test'?: string;
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
    <tr data-test="table-row">
      <td
        className="font-medium py-2 pr-2 align-top"
        data-test={'table-row-main' + props['data-test']}
      >
        {props.name}
      </td>
      <td data-test={'table-row-secondary' + props['data-test']}>
        {props.children}
      </td>
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
    <table className="text-black font-normal" data-test="table-data">
      {props.header && <thead data-test="table-header">{props.header}</thead>}
      <tbody data-test="table-children">{props.children}</tbody>
    </table>
  );
}
