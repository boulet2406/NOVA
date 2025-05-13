import React, { useMemo } from 'react'
import Head from 'next/head'
import { useTable, useFilters, useSortBy, Column } from 'react-table'
import { generateMockClients } from '../mockClients'
import { unparse } from 'papaparse'
import { MoreHorizontal } from 'lucide-react'

type Client = ReturnType<typeof generateMockClients>[number]

function DefaultColumnFilter({
  column: { filterValue, setFilter },
}: any) {
  return (
    <input
      value={filterValue || ''}
      onChange={e => setFilter(e.target.value || undefined)}
      placeholder="🔍"
      className="w-full px-1 py-0.5 bg-zinc-800 text-white rounded"
    />
  )
}

export default function ClientsPage() {
  const data = useMemo(() => generateMockClients(), [])

  const columns: Column<Client>[] = useMemo(
    () => [
      {
        Header: 'Nom',
        accessor: 'fullName',
        Filter: DefaultColumnFilter,
        Cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
      },
      {
        Header: 'ID',
        accessor: 'id',
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'AML Score',
        accessor: 'riskScore',
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Opérationnel',
        accessor: 'behavioralScore',
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Dernière MAJ',
        accessor: 'lastDate',
        Filter: DefaultColumnFilter,
        Cell: ({ row }) => row.original.scoreHistory[0]?.date || '—',
      },
      {
        Header: '',
        accessor: 'actions',
        disableFilters: true,
        Cell: ({ row }) => (
          <div className="relative group">
            <MoreHorizontal className="cursor-pointer" />
            <div className="absolute z-10 hidden group-hover:block bg-zinc-800 shadow p-2 rounded right-0">
              <button
                onClick={() => alert(`Fiche de ${row.original.firstName}`)}
                className="block text-sm text-white hover:underline"
              >
                Voir fiche
              </button>
              <button
                onClick={() => alert('Export PDF')}
                className="block text-sm text-white hover:underline"
              >
                Exporter
              </button>
              <button
                onClick={() => alert('Déclaration')}
                className="block text-sm text-white hover:underline"
              >
                Déclarer alerte
              </button>
            </div>
          </div>
        ),
      },
    ],
    []
  )

  const defaultColumn = useMemo(() => ({
    Filter: DefaultColumnFilter,
  }), [])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    { columns, data, defaultColumn },
    useFilters,
    useSortBy
  )

  const handleExportCsv = () => {
    const csvData = rows.map(row => {
      prepareRow(row)
      return {
        Nom: `${row.original.firstName} ${row.original.lastName}`,
        ID: row.original.id,
        'AML Score': row.original.riskScore,
        'Opérationnel': row.original.behavioralScore,
        'Dernière MAJ': row.original.scoreHistory[0]?.date || '—',
      }
    })

    const csv = unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clients-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Head><title>Liste des Clients – NOVA</title></Head>
      <div className="min-h-screen bg-zinc-950 text-white p-10">
        <h1 className="text-2xl font-bold mb-6">Liste des Clients</h1>

        <div className="flex justify-end mb-4">
          <button
            onClick={handleExportCsv}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg shadow-inner">
          <table {...getTableProps()} className="min-w-full text-sm bg-zinc-900">
            <thead>
              {headerGroups.map(headerGroup => (
                <tr
                  {...headerGroup.getHeaderGroupProps()}
                  className="bg-zinc-800 text-zinc-400"
                  key={headerGroup.getHeaderGroupProps().key}
                >
                  {headerGroup.headers.map(column => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className="p-2 text-left"
                      key={column.getHeaderProps().key}
                    >
                      <div className="flex items-center gap-1">
                        {column.render('Header')}
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' 🔽'
                            : ' 🔼'
                          : ''}
                      </div>
                      {column.canFilter && column.id !== 'actions' && (
                        <div>{column.render('Filter')}</div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map(row => {
                prepareRow(row)
                return (
                  <tr
                    {...row.getRowProps()}
                    className="border-t border-zinc-800 hover:bg-zinc-800 transition"
                    key={row.getRowProps().key}
                  >
                    {row.cells.map(cell => (
                      <td
                        {...cell.getCellProps()}
                        className="px-4 py-2"
                        key={cell.getCellProps().key}
                      >
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
