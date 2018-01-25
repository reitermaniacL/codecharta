package de.maibornwolff.codecharta.importer.scmlogparser.parser.git;

import org.junit.Test;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

public class CommitDateParserTest {
    @Test
    public void parseCommitDate() {
        OffsetDateTime date = CommitDateParser.parseCommitDate("Date:   Tue May 9 19:57:57 2017 +0200");
        assertThat(date).isEqualToIgnoringNanos(OffsetDateTime.of(2017, 5, 9, 19, 57, 57, 0, ZoneOffset.ofHours(2)));
    }
}