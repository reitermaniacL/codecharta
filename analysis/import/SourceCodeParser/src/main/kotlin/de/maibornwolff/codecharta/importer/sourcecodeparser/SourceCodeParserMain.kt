package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.JsonMetricWriter
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.MetricWriter
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.SourceCodeParserEntryPoint
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.TableMetricWriter
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.infrastructure.FileSystemDetailedSourceProvider
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.infrastructure.FileSystemOverviewSourceProvider
import picocli.CommandLine.*
import java.io.*
import java.nio.file.Paths
import java.util.concurrent.Callable

@Command(name = "sourcecodeparser", description = ["generates cc.JSON from source code"], footer = ["Copyright(c) 2018, MaibornWolff GmbH"])
class SourceCodeParserMain(private val outputStream: PrintStream) : Callable<Void> {
    // we need this constructor because ccsh requires an empty constructor
    constructor(): this(System.out)

    @Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @Option(names = ["-p", "--projectName"], description = ["project name"])
    private var projectName = "SourceCodeParserMain"

    @Option(names = ["-out", "--outputType"], description = ["the format to output"], converter = [(OutputTypeConverter::class)])
    private var outputType = OutputType.JSON

    @Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @Parameters(arity = "1..*", paramLabel = "FOLDER or FILEs", description = ["single code folder or files"])
    private var files: List<File> = mutableListOf()

    @Throws(IOException::class)
    override fun call(): Void? {

        if(!files[0].exists()){
            val path = Paths.get("").toAbsolutePath().toString()
            outputStream.println("Current working directory = $path")
            outputStream.println("Could not find "+files[0])
            return null
        }

        val printer = getPrinter()
        val sourceApp = SourceCodeParserEntryPoint(printer)

        if(files.size == 1 && files[0].isFile) {
            sourceApp.printDetailedMetrics(FileSystemDetailedSourceProvider(files[0]))
        } else {
            sourceApp.printOverviewMetrics(FileSystemOverviewSourceProvider(files))
        }

        return null
    }

    private fun getPrinter(): MetricWriter {
        return when(outputType){
            OutputType.JSON -> JsonMetricWriter(getWriter(), projectName)
            OutputType.TABLE -> TableMetricWriter(getWriter())
        }
    }

    private fun getWriter(): Writer {
        return if (outputFile == null) {
            OutputStreamWriter(outputStream)
        } else {
            BufferedWriter(FileWriter(outputFile))
        }
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            mainWithOutputStream(System.out, args)
        }

        @JvmStatic
        fun mainWithOutputStream(outputStream: PrintStream, args: Array<String>) {
            call(SourceCodeParserMain(outputStream), System.out, *args)
        }
    }
}

