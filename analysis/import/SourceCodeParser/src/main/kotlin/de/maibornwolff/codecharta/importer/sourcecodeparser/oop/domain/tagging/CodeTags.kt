package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.tagged.Tags

enum class CodeTags: Tags {
    PACKAGE, IMPORT, METHOD, METHOD_CALL, CONDITION, ANNOTATION, ANNOTATION_INVOCATION, ANNOTATION_ELEMENT, RESOURCE, CATCH, FINALLY, SWITCH_LABEL, THROWS_DECLARATION, INTERFACE_CONSTANT, CLASS_FIELD, CONSTRUCTOR, STATEMENT, EXPRESSION, VARIABLE, CLASS, INTERFACE, ENUM_CONSTANT, ENUM
}