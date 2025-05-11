import { Button } from 'react-bootstrap';
import { Eye, Pencil, Trash2, ChevronDown, ChevronUp, Archive, RotateCw } from 'lucide-react';
import { useState } from 'react';

const DataTable = ({
    data,
    columns,
    onView,
    onEdit,
    onDelete,
    onArchive,
    onRestore,
    emptyMessage = "Aucune donnée disponible",
    sortable = false,
    onSort,
    showArchiveButton = false,
    showRestoreButton = false
}) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        if (onSort) onSort(key, direction);
    };

    const filteredColumns = columns.filter(column =>
        (column.key !== 'id') && (column.key !== 'code_postal')
    );

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
                <div className="table-responsive rounded-lg">
                    <table className="table table-hover mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th style={{ width: '50px' }}>#</th>
                                {filteredColumns.map((column) => (
                                    <th
                                        key={column.key}
                                        className={sortable ? 'cursor-pointer' : ''}
                                        onClick={sortable ? () => handleSort(column.key) : null}
                                    >
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span className="text-nowrap">{column.label}</span>
                                            {sortable && sortConfig.key === column.key && (
                                                <span className="ms-2">
                                                    {sortConfig.direction === 'asc' ?
                                                        <ChevronUp size={16} /> :
                                                        <ChevronDown size={16} />
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                                {(onView || onEdit || onDelete || onArchive || onRestore) &&
                                    <th style={{ width: showArchiveButton || showRestoreButton ? '200px' : '150px' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={item.id} className="border-bottom">
                                    <td className="text-muted">{index + 1}</td>
                                    {filteredColumns.map((column) => (
                                        <td key={`${item.id}-${column.key}`}>
                                            <div className="d-flex align-items-center">
                                                {column.render ? column.render(item) : item[column.key]}
                                            </div>
                                        </td>
                                    ))}
                                    {(onView || onEdit || onDelete || onArchive || onRestore) && (
                                        <td>
                                            <div className="d-flex gap-2">
                                                {onView && (
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                                                        onClick={() => onView(item.id)}
                                                        title="Voir détails"
                                                    >
                                                        <Eye size={16} />
                                                    </Button>
                                                )}
                                                {onEdit && (
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                                                        onClick={() => onEdit(item.id)}
                                                        title="Modifier"
                                                    >
                                                        <Pencil size={16} />
                                                    </Button>
                                                )}
                                                {onDelete && (
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                                                        onClick={() => onDelete(item)}
                                                        title="Supprimer définitivement"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                )}
                                                {showArchiveButton && onArchive && (
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                                                        onClick={() => onArchive(item)}
                                                        title="Archiver"
                                                    >
                                                        <Archive size={16} />
                                                    </Button>
                                                )}
                                                {showRestoreButton && onRestore && (
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                                                        onClick={() => onRestore(item)}
                                                        title="Restaurer"
                                                    >
                                                        <RotateCw size={16} />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={filteredColumns.length + 2}
                                        className="text-center py-5"
                                    >
                                        <div className="d-flex flex-column align-items-center justify-content-center">
                                            <img
                                                src="/empty-state.svg"
                                                alt="Empty"
                                                style={{ width: '120px', opacity: 0.7 }}
                                                className="mb-3"
                                            />
                                            <p className="text-muted mb-0">{emptyMessage}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DataTable;