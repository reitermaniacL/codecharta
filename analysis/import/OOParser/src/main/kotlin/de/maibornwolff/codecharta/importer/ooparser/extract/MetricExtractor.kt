package de.maibornwolff.codecharta.importer.ooparser.extract

import de.maibornwolff.codecharta.importer.ooparser.intermediate.Line
import de.maibornwolff.codecharta.importer.ooparser.intermediate.SourceCode

class MetricExtractor(sourceCode: SourceCode) {

    // IMPORTANT: line numbers start at 1, but this array starts at 0
    private val rows = toRows(sourceCode)

    operator fun get(lineNumber: Int): Row {
        return rows[lineNumber - 1]
    }

    private fun toRows(sourceCode: SourceCode): Array<Row> {
        var previousRow = Row.NULL
        return sourceCode.map {
            val row = Row(it, previousRow);
            previousRow = row;
            row;
        }.toTypedArray()
    }

    fun rowCount(): Int {
        return rows.size
    }
}
