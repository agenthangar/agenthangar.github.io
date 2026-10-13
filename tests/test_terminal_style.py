import importlib.util
from pathlib import Path
from types import SimpleNamespace
import unittest

spec = importlib.util.spec_from_file_location('terminal_style', Path(__file__).resolve().parents[1] / 'scripts/demo/terminal_style.py')
style = importlib.util.module_from_spec(spec)
spec.loader.exec_module(style)

class TerminalStyleTests(unittest.TestCase):
    def test_ansi_background_and_reverse_are_preserved(self):
        cell = SimpleNamespace(fg='black', bg='green', reverse=False)
        self.assertEqual(style.cell_style(cell, 'status'), ('#141516', '#98cb92'))
        cell.reverse = True
        self.assertEqual(style.cell_style(cell, 'status'), ('#98cb92', '#141516'))

    def test_explicit_ansi_color_wins_over_semantic_accent(self):
        cell = SimpleNamespace(fg='ff00aa', bg='default', reverse=False)
        self.assertEqual(style.cell_style(cell, '+ added code')[0], '#ff00aa')
        self.assertEqual(style.ansi_color('brown', ''), '#f2a93b')

    def test_diff_and_results_without_coloring_collapsed_output_as_additions(self):
        self.assertEqual(style.line_accent('+ return tasks'), '#98cb92')
        self.assertEqual(style.line_accent('- return tasks'), '#f38b82')
        self.assertEqual(style.line_accent('OK'), '#98cb92')
        self.assertEqual(style.line_accent('+ 51 lines (ctrl+t to expand)'), '#ebe7df')
